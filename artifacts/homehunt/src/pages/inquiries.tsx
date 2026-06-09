import { MainLayout } from "@/components/layout/MainLayout";
import {
  useListReceivedInquiries,
  useMarkInquiryRead,
  getListReceivedInquiriesQueryKey,
  getGetUnreadInquiriesCountQueryKey,
  getGetLandlordStatsQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MessageSquare, Phone, User, Home, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function InquiriesPage() {
  const queryClient = useQueryClient();
  const { data: inquiries, isLoading } = useListReceivedInquiries({
    query: { queryKey: getListReceivedInquiriesQueryKey() },
  });
  const markRead = useMarkInquiryRead();

  const handleMarkRead = async (id: number) => {
    try {
      await markRead.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListReceivedInquiriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetUnreadInquiriesCountQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetLandlordStatsQueryKey() });
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const unreadCount = inquiries?.filter((i) => i.status === "unread").length || 0;

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Inquiries
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-sm px-2.5 py-0.5">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Messages from tenants about your listings.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : !inquiries || inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-1">No inquiries yet</h3>
            <p className="text-muted-foreground text-sm">
              When tenants contact you about your listings, you'll see their messages here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                className={`transition-all ${inquiry.status === "unread" ? "border-primary/40 bg-primary/5 shadow-sm" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {inquiry.tenantName || "Anonymous Tenant"}
                        </div>
                        {inquiry.tenantPhone && (
                          <a
                            href={`tel:${inquiry.tenantPhone}`}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {inquiry.tenantPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {inquiry.status === "unread" && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <Link href={`/house/${inquiry.houseId}`} className="flex items-center gap-2 text-sm text-muted-foreground mb-3 hover:text-primary transition-colors">
                    <Home className="h-4 w-4" />
                    <span className="font-medium">{inquiry.houseTitle}</span>
                    {inquiry.houseCity && <span>· {inquiry.houseCity}</span>}
                  </Link>

                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
                    {inquiry.message}
                  </p>

                  {inquiry.status === "unread" && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(inquiry.id)}
                        disabled={markRead.isPending}
                      >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark as Read
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
