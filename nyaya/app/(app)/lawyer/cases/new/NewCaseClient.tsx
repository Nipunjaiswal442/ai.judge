"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CASE_CATEGORIES } from "@/lib/caseCategories";
import { Id } from "@/convex/_generated/dataModel";

export default function NewCaseClient({ userId }: { userId: Id<"users"> }) {
  const router = useRouter();
  const createCase = useMutation(api.cases.createCase);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    complainantName: "",
    opposingPartyName: "",
    claimAmount: "",
    jurisdiction: "",
    reliefSought: "",
    opposingLawyerEmailInvite: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const caseId = await createCase({
        category: formData.category,
        complainantLawyerId: userId,
        complainantName: formData.complainantName,
        opposingPartyName: formData.opposingPartyName,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        jurisdiction: formData.jurisdiction,
        reliefSought: formData.reliefSought,
        opposingLawyerEmailInvite: formData.opposingLawyerEmailInvite || undefined,
      });
      
      router.push(`/lawyer/cases/${caseId}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Failed to create case.");
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Case Category <span className="text-red-500">*</span></Label>
                <Select required onValueChange={(val) => handleChange("category", val as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction (Forum) <span className="text-red-500">*</span></Label>
                <Input 
                  id="jurisdiction" 
                  placeholder="e.g. DCDRC, Delhi" 
                  required 
                  value={formData.jurisdiction}
                  onChange={(e) => handleChange("jurisdiction", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="complainantName">Complainant Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="complainantName" 
                  placeholder="Full Name" 
                  required 
                  value={formData.complainantName}
                  onChange={(e) => handleChange("complainantName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposingPartyName">Opposing Party Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="opposingPartyName" 
                  placeholder="Company or Individual Name" 
                  required 
                  value={formData.opposingPartyName}
                  onChange={(e) => handleChange("opposingPartyName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claimAmount">Claim Amount (INR) <span className="text-red-500">*</span></Label>
              <Input 
                id="claimAmount" 
                type="number" 
                min="0"
                placeholder="0.00" 
                required 
                value={formData.claimAmount}
                onChange={(e) => handleChange("claimAmount", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reliefSought">Relief Sought <span className="text-red-500">*</span></Label>
              <Textarea 
                id="reliefSought" 
                placeholder="Briefly describe the specific relief sought (e.g. refund, replacement, compensation)" 
                required 
                rows={3}
                value={formData.reliefSought}
                onChange={(e) => handleChange("reliefSought", e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Label htmlFor="opposingLawyerEmail">Opposing Counsel Invite (Optional)</Label>
              <p className="text-xs text-slate-500 pb-1">
                If the opposing party is represented, invite their counsel to join this workspace.
              </p>
              <Input 
                id="opposingLawyerEmail" 
                type="email" 
                placeholder="opposing.counsel@law.in" 
                value={formData.opposingLawyerEmailInvite}
                onChange={(e) => handleChange("opposingLawyerEmailInvite", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0a1f44] hover:bg-[#1e3a8a] text-white" disabled={loading}>
            {loading ? "Creating..." : "Create Case"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
