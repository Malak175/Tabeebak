import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, Plus, Trash2, Stethoscope } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDoctorPrescriptionMutation, useDoctorAppointmentDetailsQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { toast } from "sonner";

type MedicationFormValues = {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type FormValues = {
  medications: MedicationFormValues[];
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

const CreatePrescription = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = getDisplayName(user ?? {});
  const appointmentQuery = useDoctorAppointmentDetailsQuery(appointmentId, Boolean(user));
  const createPrescriptionMutation = useCreateDoctorPrescriptionMutation(appointmentId ?? "");

  const { register, control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      medications: [
        {
          medicationName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  const patientSummary = useMemo(() => {
    const data = appointmentQuery.data;
    if (!data) return "Patient details unavailable";

    const parts = [
      data.patientAge != null ? `${data.patientAge} yrs` : null,
      data.patientGender,
      data.patientPhone,
    ].filter(Boolean);

    return parts.length ? parts.join(" • ") : "Patient details unavailable";
  }, [appointmentQuery.data]);

  const onSubmit = (values: FormValues) => {
    if (!appointmentId) {
      toast.error("Missing appointment id.");
      return;
    }

    const medications = values.medications
      .map((med) => ({
        medicationName: med.medicationName.trim(),
        dosage: med.dosage.trim() || null,
        frequency: med.frequency.trim() || null,
        duration: med.duration.trim() || null,
        instructions: med.instructions.trim() || null,
      }))
      .filter((med) => med.medicationName.length > 0);

    if (medications.length === 0) {
      toast.error("Add at least one medication before submitting.");
      return;
    }

    const payload = {
      appointmentId,
      medications,
    };

    createPrescriptionMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Prescription created successfully.");
        navigate(`/doctor/appointments/${appointmentId}`);
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 space-y-2">
        <Button asChild variant="ghost" className="-ml-4">
          <Link to={`/doctor/appointments/${appointmentId ?? ""}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to appointment
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Create Prescription</h1>
        <p className="text-muted-foreground">Write a prescription tied to this appointment.</p>
      </div>

      {appointmentQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : appointmentQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load appointment</AlertTitle>
          <AlertDescription>{(appointmentQuery.error as Error).message}</AlertDescription>
        </Alert>
      ) : appointmentQuery.data ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">
                {appointmentQuery.data.patientName}
              </p>
              <p>{patientSummary}</p>
              <p>Scheduled: {formatDateTime(appointmentQuery.data.scheduledAt)}</p>
              <p>Reason: {appointmentQuery.data.reason || "Not recorded yet"}</p>
              <p>Diagnosis: {appointmentQuery.data.diagnosis || "Not recorded yet"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Prescription Details</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    medicationName: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    instructions: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add medication
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-sm font-semibold">Medication {index + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.medicationName`}>
                            Medication name
                          </Label>
                          <Input
                            id={`medications.${index}.medicationName`}
                            placeholder="e.g. Amoxicillin"
                            {...register(`medications.${index}.medicationName`, {
                              required: "Medication name is required",
                            })}
                          />
                          {formState.errors.medications?.[index]?.medicationName ? (
                            <p className="text-xs text-destructive">
                              {formState.errors.medications[index]?.medicationName?.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.dosage`}>Dosage</Label>
                          <Input
                            id={`medications.${index}.dosage`}
                            placeholder="e.g. 500mg"
                            {...register(`medications.${index}.dosage`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.frequency`}>Frequency</Label>
                          <Input
                            id={`medications.${index}.frequency`}
                            placeholder="e.g. Twice daily"
                            {...register(`medications.${index}.frequency`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.duration`}>Duration</Label>
                          <Input
                            id={`medications.${index}.duration`}
                            placeholder="e.g. 7 days"
                            {...register(`medications.${index}.duration`)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medications.${index}.instructions`}>Instructions</Label>
                        <Textarea
                          id={`medications.${index}.instructions`}
                          placeholder="Additional instructions"
                          {...register(`medications.${index}.instructions`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={createPrescriptionMutation.isPending}>
                    {createPrescriptionMutation.isPending ? "Creating..." : "Create prescription"}
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link to={`/doctor/appointments/${appointmentId ?? ""}`}>Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Appointment details were not returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default CreatePrescription;
