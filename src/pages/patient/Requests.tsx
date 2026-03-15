import { useState } from "react";
import { FileClock, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  EmptyCard,
  ErrorCard,
  LoadingCard,
  RequestSummaryCard,
} from "@/components/patient/BookingFlowSection";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAppointmentRequestsQuery, useTestRequestsQuery } from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";

const PatientRequestsPage = () => {
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const [doctorSearch, setDoctorSearch] = useState("");
  const [labSearch, setLabSearch] = useState("");

  const doctorRequestsQuery = useAppointmentRequestsQuery({ search: doctorSearch, limit: 20 });
  const labRequestsQuery = useTestRequestsQuery({ search: labSearch, limit: 20 });

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={User}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Unified Requests</p>
          <h1 className="mt-2 text-3xl font-bold">Track request status and messages</h1>
          <p className="mt-2 text-muted-foreground">
            Doctor and lab requests are tracked separately, but they share the same patient-facing request UX.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/patient/book">
            <FileClock className="h-4 w-4" />
            Start new request
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="doctor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="doctor">Doctor Requests</TabsTrigger>
          <TabsTrigger value="lab">Lab Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="doctor" className="space-y-4">
          <Input
            value={doctorSearch}
            onChange={(event) => setDoctorSearch(event.target.value)}
            placeholder="Search doctor requests"
          />
          {doctorRequestsQuery.isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
            </>
          ) : doctorRequestsQuery.isError ? (
            <ErrorCard
              title="Unable to load doctor requests"
              message={(doctorRequestsQuery.error as Error).message}
            />
          ) : doctorRequestsQuery.data?.data.length ? (
            <div className="space-y-4">
              {doctorRequestsQuery.data.data.map((request) => (
                <RequestSummaryCard
                  key={request.id}
                  request={request}
                  href={`/patient/requests/doctor/${request.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No doctor requests yet"
              description="Submit your first appointment request to start a thread."
              action={
                <Button asChild>
                  <Link to="/patient/doctors">Browse doctors</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="lab" className="space-y-4">
          <Input
            value={labSearch}
            onChange={(event) => setLabSearch(event.target.value)}
            placeholder="Search lab requests"
          />
          {labRequestsQuery.isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
            </>
          ) : labRequestsQuery.isError ? (
            <ErrorCard title="Unable to load lab requests" message={(labRequestsQuery.error as Error).message} />
          ) : labRequestsQuery.data?.data.length ? (
            <div className="space-y-4">
              {labRequestsQuery.data.data.map((request) => (
                <RequestSummaryCard
                  key={request.id}
                  request={request}
                  href={`/patient/requests/lab/${request.id}`}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No lab requests yet"
              description="Submit your first lab request to start a thread."
              action={
                <Button asChild>
                  <Link to="/patient/labs">Browse labs</Link>
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientRequestsPage;
