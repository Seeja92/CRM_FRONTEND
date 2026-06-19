"use client";

import { useParams, useRouter } from "next/navigation";
import LeadView from "@/components/leads/LeadView";
import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const token = localStorage.getItem("access");
        console.log("Token:", token);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/${leadId}/`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log(
          "Fetching:",
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/${leadId}/`,
        );
        console.log("Status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("Lead API response:", data);
          setLead({
            id: data.id,
            name: `${data.first_name} ${data.last_name}`.trim(),
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phone: data.phone,
            jobTitle: data.job_title,
            companyName: data.company_name,
            status: data.status,
            createdDate: data.created_date,
            contactOwner: data.contact_owner,
            city:data.city,
          });
        } else {
          const err = await res.json();
          console.error("API error:", err); // 👈 add this
        }
      } catch (err) {
        console.error("Failed to fetch lead:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#6c63ff" }} />
      </Box>
    );
  }

  if (!lead) {
    return <Box sx={{ p: 3 }}>Lead not found.</Box>;
  }

  return <LeadView lead={lead} onBack={() => router.push("/leads")} />;
}
