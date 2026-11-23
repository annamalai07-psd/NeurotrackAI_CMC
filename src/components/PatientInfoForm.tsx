import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PatientInfo {
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  physician: string;
  scanDate: string;
}

interface PatientInfoFormProps {
  onSubmit: (patientInfo: PatientInfo) => void;
  onCancel: () => void;
}

const PatientInfoForm = ({ onSubmit, onCancel }: PatientInfoFormProps) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    patientId: "",
    patientName: "",
    age: "",
    gender: "",
    physician: "",
    scanDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(patientInfo);
  };

  const handleChange = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Patient Information</CardTitle>
        <CardDescription>
          Please enter patient details before proceeding with CT scan analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientInfo.patientId}
                onChange={(e) => handleChange("patientId", e.target.value)}
                placeholder="Enter patient ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={patientInfo.patientName}
                onChange={(e) => handleChange("patientName", e.target.value)}
                placeholder="Enter patient name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={patientInfo.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Enter age"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={patientInfo.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                placeholder="Enter gender"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="physician">Attending Physician</Label>
              <Input
                id="physician"
                value={patientInfo.physician}
                onChange={(e) => handleChange("physician", e.target.value)}
                placeholder="Enter physician name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scanDate">Scan Date</Label>
              <Input
                id="scanDate"
                type="date"
                value={patientInfo.scanDate}
                onChange={(e) => handleChange("scanDate", e.target.value)}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="medical">
              Continue to Analysis
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientInfoForm;