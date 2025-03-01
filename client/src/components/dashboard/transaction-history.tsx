import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Transaction } from "@shared/schema";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";

export function TransactionHistory() {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/users/${user?.id}/transactions`],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Your credit purchases and usage history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === 'credit_purchase' ? (
                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    )}
                    {transaction.type === 'credit_purchase' ? 'Purchase' : 'Usage'}
                  </div>
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type === 'credit_purchase' ? 'text-green-500' : 'text-red-500'}>
                    {transaction.type === 'credit_purchase' ? '+' : '-'}{transaction.amount}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {(!transactions || transactions.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
