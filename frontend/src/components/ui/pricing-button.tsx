import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function PricingButton() {
  return (
    <Link href="/pricing">
      <Button variant="outline">View Pricing</Button>
    </Link>
  );
}
