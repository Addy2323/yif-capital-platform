"use client"

import React from "react"

import { useState } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Loader2, CheckCircle } from "lucide-react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

const contactInfo = [
  {
    icon: MapPin,
    title: "Office Address",
    details: ["Ohio Street, Dar es Salaam", "Tanzania"],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+255 22 211 0000", "+255 754 000 000"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@yifcapital.co.tz", "support@yifcapital.co.tz"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon - Fri: 8:00 AM - 5:00 PM", "Sat: 9:00 AM - 1:00 PM"],
  },
]

function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-navy py-16 lg:py-24">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/logo%20payment/background/contact.png"
              alt="Background"
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-navy/60" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
            <ScrollAnimation animation="slide-up" className="text-center">
              <h1 className="text-3xl font-bold text-white lg:text-5xl text-balance">
                Get in Touch
              </h1>
              <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto text-pretty">
                Have questions about our platform or services? Our team is here to help you with anything you need.
              </p>
            </ScrollAnimation>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <ScrollAnimation animation="slide-right">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-gold" />
                      Send us a Message
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we will get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Message Sent!</h3>
                        <p className="mt-2 text-muted-foreground">
                          Thank you for reaching out. We will respond to your inquiry shortly.
                        </p>
                        <Button
                          className="mt-6 bg-gold text-navy hover:bg-gold/90"
                          onClick={() => setIsSubmitted(false)}
                        >
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                              id="phone"
                              placeholder="+255 700 000 000"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              placeholder="How can we help?"
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            className="min-h-[150px]"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gold text-navy hover:bg-gold/90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </ScrollAnimation>

              {/* Contact Information */}
              <ScrollAnimation animation="slide-left" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
                  <p className="mt-2 text-muted-foreground">
                    Reach out to us through any of the following channels.
                  </p>
                </div>

                <div className="grid gap-6">
                  {contactInfo.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                        <item.icon className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        {item.details.map((detail) => (
                          <p key={detail} className="text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="mr-2 h-5 w-5" />
                    Interactive Map Coming Soon
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function ContactPage() {
  return (
    <ContactContent />
  )
}
