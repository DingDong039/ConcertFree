// frontend/src/views/home/ui/HomePage.tsx
"use client";

import Link from "next/link";
import {
  Ticket,
  Shield,
  Zap,
  Music,
  Calendar,
  Users,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  InteractiveLogo,
  IsometricTransaction,
  IsometricStage,
} from "@/shared/ui";
import { useIsAuthenticated } from "@/features/auth";
import { ROUTES, APP_NAME } from "@/shared/config";
import { type Concert } from "@/entities/concert";
import { ConcertCard } from "@/widgets/concert-card";
import useSWR from "swr";
import { fetcher } from "@/shared/api";

interface HomePageProps {
  initialConcerts?: Concert[];
}

export function HomePage({ initialConcerts = [] }: HomePageProps) {
  const isAuthenticated = useIsAuthenticated();
  const { data: concerts, isLoading } = useSWR<Concert[]>("/concerts", fetcher, {
    fallbackData: initialConcerts,
  });
  
  // If we have fallback data, it won't be "isLoading" initially 
  const displayConcerts = concerts && concerts.length > 0 ? concerts : initialConcerts;
  const featuredConcerts = displayConcerts.slice(0, 3);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text and CTA */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Music className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Your Gateway to Live Music
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                Book Tickets for the
                <br />
                <span className="text-orange-300">Best Concerts & Events</span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
                Discover amazing live performances and secure your spot in just
                a few clicks.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                <Link href={isAuthenticated ? ROUTES.CONCERTS : ROUTES.LOGIN}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    Browse Concerts
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href={ROUTES.REGISTER}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10 rounded-full px-8 transition-colors"
                    >
                      Get Started
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: 3D Interactive Art */}
            <div className="hidden lg:flex justify-center items-center animate-in zoom-in duration-1000 delay-500 fill-mode-both">
              <InteractiveLogo />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/50 backdrop-blur-md relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, value: "500+", label: "Events" },
              { icon: Users, value: "50K+", label: "Happy Customers" },
              { icon: Ticket, value: "100K+", label: "Tickets Sold" },
              { icon: Star, value: "4.9", label: "Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose {APP_NAME}?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make concert ticket booking simple, secure, and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Ticket,
                title: "Easy Booking",
                description:
                  "Book your tickets in just a few clicks. No hassle, no waiting in lines.",
                color: "text-blue-500",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description:
                  "Your transactions are protected with industry-standard encryption.",
                color: "text-emerald-500",
                bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
              },
              {
                icon: Zap,
                title: "Instant Confirmation",
                description:
                  "Get your tickets confirmed instantly. No delays, no complications.",
                color: "text-orange-500",
                bgColor: "bg-orange-100 dark:bg-orange-900/30",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="concert-card border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 backdrop-blur-sm"
              >
                <CardContent className="pt-8 text-center">
                  <div
                    className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-slate-50 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-slate-800/60 hidden sm:block relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="text-center mb-0 relative z-10">
              <h3 className="text-3xl font-bold font-heading mb-4">
                Seamless Ticket Transfers
              </h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Can&apos;t make it to the show? Send your tickets instantly to
                friends via email or phone. Zero transfer fees, 100% secure.
              </p>
            </div>
            {/* Negative margin to pull the illustration up a bit closer to the text */}
            <div className="-mt-8 relative z-10">
              <IsometricTransaction />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Concerts Section */}
      <section className="py-16 lg:py-24 px-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                Featured Concerts
              </h2>
              <p className="text-muted-foreground">
                Don&apos;t miss out on these amazing events
              </p>
            </div>
            <Link
              href={ROUTES.CONCERTS}
              className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoading && !displayConcerts.length ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-3 flex-1 w-full max-w-sm">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-10 w-full sm:w-32 shrink-0" />
                </div>
              ))}
            </div>
          ) : featuredConcerts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {featuredConcerts.map((concert) => (
                <ConcertCard key={concert.id} concert={concert} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 bg-white dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800/50">
              <CardContent>
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No concerts available at the moment
                </p>
                <Link href={ROUTES.CONCERTS}>
                  <Button>Browse All Concerts</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href={ROUTES.CONCERTS}>
              <Button variant="outline" className="rounded-full">
                View All Concerts
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-linear-to-r from-primary to-blue-600 border-0 text-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>

            <CardContent className="py-12 px-8 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Ready to Book Your Next Experience?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of music lovers who trust {APP_NAME} for their
                concert tickets.
              </p>
              <Link href={isAuthenticated ? ROUTES.CONCERTS : ROUTES.REGISTER}>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-8"
                >
                  <Ticket className="w-5 h-5 mr-2" />
                  {isAuthenticated ? "Browse Concerts" : "Get Started Now"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* --- Footer Isometric Scene --- */}
      <section className="relative z-0 mt-8 mb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          <div className="inline-block animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            <h2 className="text-3xl md:text-5xl font-black font-heading mb-4 text-emerald-950 dark:text-emerald-400">
              The Stage is Yours
            </h2>
            <p className="text-lg text-emerald-800 dark:text-emerald-200/70 max-w-2xl mx-auto mb-8">
              Join thousands of others in the ultimate concert experience.
            </p>
          </div>
          <IsometricStage />
        </div>
      </section>
    </div>
  );
}
