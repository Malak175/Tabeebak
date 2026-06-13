import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

interface AuthLayoutProps {
    children: ReactNode;
    backHref?: string;
    backLabel?: string;
}

const AuthLayout = ({ children, backHref = "/", backLabel = "Back to Home" }: AuthLayoutProps) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="TABEEBAK" className="h-11 w-11 rounded-2xl object-cover shadow-sm" />
                    <div className="space-y-1">
                        <p className="text-lg font-semibold tracking-tight text-foreground">TABEEBAK</p>
                        <p className="text-sm text-muted-foreground">A modern healthcare platform for patients, doctors, and labs.</p>
                    </div>
                </div>
                {backHref ? (
                    <Link
                        to={backHref}
                        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary hover:shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                ) : null}
            </div>

            <Card className="overflow-hidden border border-border/80 bg-card shadow-2xl shadow-slate-900/5 dark:shadow-slate-950/20">
                <CardContent className="p-6 sm:p-8">{children}</CardContent>
            </Card>
        </div>
    </div>
);

export default AuthLayout;
