# model.py
import torch
import torch.nn as nn
import torch.nn.functional as F

# Attention Gate
class AttentionGate(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super().__init__()
        self.W_g = nn.Sequential(
            nn.Conv2d(F_g, F_int, 1),
            nn.BatchNorm2d(F_int)
        )
        self.W_x = nn.Sequential(
            nn.Conv2d(F_l, F_int, 1),
            nn.BatchNorm2d(F_int)
        )
        self.psi = nn.Sequential(
            nn.Conv2d(F_int, 1, 1),
            nn.BatchNorm2d(1),
            nn.Sigmoid()
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, g, x):
        g = F.interpolate(g, size=x.shape[2:], mode="bilinear", align_corners=False)
        psi = self.relu(self.W_g(g) + self.W_x(x))
        psi = self.psi(psi)
        return x * psi

# Conv Block
class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)

# ViT Bottleneck 
class ViTBottleneck(nn.Module):
    def __init__(self, in_channels, patch_size=16, embed_dim=256, depth=4, num_heads=8):
        super().__init__()

        self.patch_embed = nn.Conv2d(
            in_channels,
            embed_dim,
            kernel_size=patch_size,
            stride=patch_size
        )

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            batch_first=True
        )

        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=depth
        )

        self.proj = nn.Conv2d(embed_dim, in_channels, 1)

    def forward(self, x):
        B, C, H, W = x.shape
        x = self.patch_embed(x)
        h, w = x.shape[2], x.shape[3]

        x = x.flatten(2).transpose(1, 2)
        x = self.transformer(x)

        x = x.transpose(1, 2).view(B, -1, h, w)
        return self.proj(x)

# Segmentation Model
class CNN_ViT_AttnSeg(nn.Module):
    def __init__(self):
        super().__init__()
        self.e1 = ConvBlock(1, 64)
        self.e2 = ConvBlock(64, 128)
        self.e3 = ConvBlock(128, 256)
        self.pool = nn.MaxPool2d(2)

        self.vit = ViTBottleneck(256)

        self.att3 = AttentionGate(256, 128, 64)
        self.d3 = ConvBlock(256 + 128, 128)

        self.att2 = AttentionGate(128, 64, 32)
        self.d2 = ConvBlock(128 + 64, 64)

        self.out = nn.Conv2d(64, 1, 1)

    def forward(self, x):
        e1 = self.e1(x)
        e2 = self.e2(self.pool(e1))
        e3 = self.e3(self.pool(e2))

        b = self.vit(self.pool(e3))

        d3 = F.interpolate(b, size=e2.shape[2:], mode="bilinear", align_corners=False)
        d3 = self.d3(torch.cat([d3, self.att3(d3, e2)], dim=1))

        d2 = F.interpolate(d3, size=e1.shape[2:], mode="bilinear", align_corners=False)
        d2 = self.d2(torch.cat([d2, self.att2(d2, e1)], dim=1))

        return self.out(d2)

# Classification Model
class StrokeClassifier(nn.Module):
    def __init__(self, seg_model):
        super().__init__()
        self.encoder = seg_model
        for p in self.encoder.parameters():
            p.requires_grad = False

        self.proj1 = nn.Conv2d(64, 64, 1)
        self.proj2 = nn.Conv2d(128, 64, 1)
        self.proj3 = nn.Conv2d(256, 64, 1)

        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(64 * 3, 128),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(128, 1)
        )

    def forward(self, x):
        with torch.no_grad():
            e1 = self.encoder.e1(x)
            e2 = self.encoder.e2(self.encoder.pool(e1))
            e3 = self.encoder.e3(self.encoder.pool(e2))

        f1 = self.proj1(e1)
        f2 = F.interpolate(self.proj2(e2), size=f1.shape[2:], mode="bilinear")
        f3 = F.interpolate(self.proj3(e3), size=f1.shape[2:], mode="bilinear")

        fused = torch.cat([f1, f2, f3], dim=1)
        return self.classifier(fused)
