"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, ExternalLink, Globe, Heart, Mail, MessageSquare, ShieldCheck, Sparkles, Star, Users, Pill, Check, Award, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function AboutPage() {
  const stats = [
    { 
      title: "Active Users", 
      value: "50K+", 
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+12% from last month"
    },
    { 
      title: "Medications Tracked", 
      value: "1.2M", 
      icon: <Pill className="h-5 w-5 text-primary" />,
      change: "+8% from last month"
    },
    { 
      title: "Adherence Rate", 
      value: "93%", 
      icon: <Check className="h-5 w-5 text-primary" />,
      change: "+5% from last month"
    },
    { 
      title: "Issues Prevented", 
      value: "45K+", 
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      change: "+15% from last month"
    },
  ]

  const teamMembers = [
    {
      name: "Arindam Hore",
      role: "Lead Developer & Project Architect",
      image: "/placeholder-user.jpg",
      bio: "Full-stack developer with expertise in healthcare applications and medication management systems.",
      social: { linkedin: "https://linkedin.com/in/arindam-hore" }
    },
    {
      name: "Harshit Kumar Sharma",
      role: "Frontend Developer & UX Designer",
      image: "/placeholder-user.jpg",
      bio: "Specialized in creating intuitive user interfaces with a focus on accessibility and user experience.",
      social: { linkedin: "https://linkedin.com/in/harshit-kumar-sharma" }
    },
    {
      name: "Aniket Kumar Sharma",
      role: "Backend Developer & Database Specialist",
      image: "/placeholder-user.jpg",
      bio: "Expert in building robust backend systems and optimizing database performance for healthcare applications.",
      social: { linkedin: "https://linkedin.com/in/aniket-kumar-sharma" }
    }
  ]

  const features = [
    {
      title: "Smart Medication Management",
      description: "Intelligent tracking and reminders with personalized schedules based on your medication needs.",
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      metric: "99.8% on-time reminders",
      progress: 95
    },
    {
      title: "Advanced Interaction Checker",
      description: "Real-time analysis of potential drug interactions with detailed severity assessment and recommendations.",
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      metric: "100+ databases integrated",
      progress: 90
    },
    {
      title: "AI-Powered Assistant",
      description: "Get instant answers to medication questions and personalized advice for your health concerns.",
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      metric: "98% question accuracy",
      progress: 85
    },
    {
      title: "Comprehensive Adherence Tracking",
      description: "Visual insights into your medication adherence patterns with personalized improvement strategies.",
      icon: <Heart className="h-10 w-10 text-primary" />,
      metric: "27% improved adherence",
      progress: 92
    }
  ]

  const timeline = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Ayurveda was established by a team of healthcare professionals and technologists.",
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      year: "2021",
      title: "First Platform Release",
      description: "Initial version of the medication management system launched to early adopters.",
      icon: <Award className="h-6 w-6" />
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Introduction of artificial intelligence for personalized medication insights.",
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      year: "2023",
      title: "Enterprise Solution",
      description: "Expanded to provide solutions for healthcare organizations and pharmacies.",
      icon: <Users className="h-6 w-6" />
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Available in 20+ countries with support for multiple languages and regional medication databases.",
      icon: <Globe className="h-6 w-6" />
    }
  ]

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">About Ayurveda</h1>
        <p className="text-muted-foreground">
          Empowering better medication management through innovative technology
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Our Story Section */}
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-2xl">Our Story</CardTitle>
              <CardDescription>
                Building a better medication experience
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <p>
                Ayurveda was born from a simple observation: medication management is unnecessarily complex,
                especially for those managing multiple prescriptions or caring for loved ones.
              </p>
              <p>
                Founded in 2020 by a team of healthcare professionals and technologists, we set out to create
                a solution that combines clinical expertise with user-friendly technology.
              </p>
              <p>
                Today, Ayurveda helps thousands of users safely manage their medications, prevent harmful
                interactions, and maintain better adherence to their treatment plans.
              </p>
            </CardContent>
          </div>
          <div className="md:w-1/2 bg-gradient-to-br from-primary/30 via-primary/20 to-background relative min-h-[250px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-background/90 p-5 backdrop-blur">
                <Users className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-6 right-6 bg-background/90 rounded-lg p-4 backdrop-blur max-w-xs">
              <p className="text-sm font-medium">
                "Our goal is to empower patients with the tools and knowledge to take control of their medication journey."
              </p>
              <p className="text-xs text-muted-foreground mt-2">— Ayurveda Founding Team</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Our Journey</h2>
          <p className="text-muted-foreground">The evolution of Ayurveda over the years</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="relative ml-3">
              {timeline.map((item, index) => (
                <div key={index} className="mb-8 flex last:mb-0">
                  <div className="absolute left-0 top-0 bottom-0 flex w-6 items-center justify-center">
                    <div className="h-full w-[1px] bg-border" />
                  </div>
                  <div className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-primary">
                    {item.icon}
                  </div>
                  <div className="flex-1 overflow-hidden pl-8">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <Badge variant="secondary">{item.year}</Badge>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Our Core Features</h2>
          <p className="text-muted-foreground">
            Comprehensive tools designed to make medication management simpler, safer, and more effective
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{feature.metric}</span>
                  <span className="text-sm text-muted-foreground">{feature.progress}%</span>
                </div>
                <Progress value={feature.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Meet Our Team</h2>
          <p className="text-muted-foreground">
            A passionate group of healthcare professionals, developers, and designers dedicated to improving medication management
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full">
          {teamMembers.map((member, index) => (
            <Card key={index} className="overflow-hidden h-full">
              <div className="aspect-square relative bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between mt-auto">
                <Button variant="ghost" size="sm">View Profile</Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 flex items-center">
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl">Get In Touch</CardTitle>
                <CardDescription>
                  Have questions or feedback? We'd love to hear from you.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <p className="text-sm text-muted-foreground mt-1">support@ayurveda.io</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Visit Our Website</h3>
                    <p className="text-sm text-muted-foreground mt-1">www.ayurveda.io</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <h3 className="text-xl font-medium mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Stay updated with the latest features, medication insights, and health tips.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 