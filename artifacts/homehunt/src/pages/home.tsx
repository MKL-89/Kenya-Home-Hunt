import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { useGetCityBreakdown } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";

export function Home() {
  const { data: cityStats } = useGetCityBreakdown();

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <section className="relative overflow-hidden bg-sidebar pt-24 pb-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-5xl font-bold tracking-tight text-sidebar-foreground sm:text-6xl mb-6">
                Find your next home in Kenya.
              </h1>
              <p className="text-lg leading-8 text-sidebar-foreground/80 mb-10">
                A sleek, modern property marketplace built for Kenya. Tenants scroll a map discovering vacant homes; landlords manage listings with pride.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/sign-up">Start Exploring</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-sidebar/50 bg-[url('https://images.unsplash.com/photo-1547471080-7cb2acd4e6ee?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        </section>

        <section className="py-24 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Explore Top Cities</h2>
              <p className="mt-4 text-lg text-muted-foreground">Find vacant homes in major Kenyan cities</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cityStats?.map((stat) => (
                <div key={stat.city} className="rounded-2xl border bg-card text-card-foreground p-6 shadow-sm hover-elevate transition-all">
                  <h3 className="text-2xl font-semibold mb-2">{stat.city}</h3>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Vacant Homes</span>
                      <span className="font-medium">{stat.vacant}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Listings</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Avg. Rent</span>
                      <span className="font-medium text-primary">{formatCurrency(stat.avgRent)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
