import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Wrench, 
  Smartphone, 
  Monitor, 
  Globe, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">BC</span>
            </div>
            <span className="text-2xl font-bold text-primary">ByteCare</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a>
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#download" className="text-muted-foreground hover:text-primary transition-colors">Download</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </nav>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Your Trusted Partner for
          <span className="text-primary block mt-2">Device Repair & Digital Services</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Professional PC repair, mobile repair, and digital services in Barrackpore. 
          Fast, reliable, and affordable solutions for all your tech needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#services">
            <Button size="lg" variant="outline">
              View Services
            </Button>
          </a>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Download ByteCare Desktop App</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Get our Windows desktop application for easy access to your repair shop management system.
            Manage customers, repairs, invoices, and more from your desktop.
          </p>
          <a 
            href="http://167.71.237.250/ByteCare-Setup-1.0.0.exe" 
            download="ByteCare-Setup-1.0.0.exe"
            className="inline-flex"
          >
            <Button size="lg" variant="secondary" className="gap-2">
              <Download className="h-5 w-5" />
              Download for Windows (73 MB)
            </Button>
          </a>
          <p className="text-primary-foreground/60 text-sm mt-4">
            Version 1.0.0 | Windows 10/11 (64-bit)
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Our Services</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          We offer comprehensive repair and digital services to keep your devices running smoothly
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>PC Repair</CardTitle>
              <CardDescription>
                Expert repair services for desktops and laptops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Hardware diagnostics & repair
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  OS installation & recovery
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Virus removal & security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Data backup & recovery
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Mobile Repair</CardTitle>
              <CardDescription>
                Professional mobile phone repair services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Screen replacement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Battery replacement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Charging port repair
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Software troubleshooting
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Digital Services</CardTitle>
              <CardDescription>
                Web development and digital marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Website development
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Mobile app development
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SEO & digital marketing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Graphic design
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose ByteCare?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            We combine expertise with excellent customer service to deliver the best repair experience
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Technicians</h3>
              <p className="text-sm text-muted-foreground">
                Skilled professionals with years of experience
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quick Turnaround</h3>
              <p className="text-sm text-muted-foreground">
                Most repairs completed within 24-48 hours
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Warranty Included</h3>
              <p className="text-sm text-muted-foreground">
                All repairs come with service warranty
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Customer Support</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated support for all your queries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary mb-2">500+</p>
            <p className="text-muted-foreground">Devices Repaired</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">200+</p>
            <p className="text-muted-foreground">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">50+</p>
            <p className="text-muted-foreground">Digital Projects</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">98%</p>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">About ByteCare</h2>
            <p className="text-muted-foreground mb-6">
              ByteCare is a leading repair shop in Barrackpore, West Bengal, founded by Sayan Roy Chowdhury. 
              We specialize in PC repair, mobile repair, and digital services, providing comprehensive 
              solutions for all your technology needs.
            </p>
            <p className="text-muted-foreground">
              Our mission is to deliver high-quality, affordable repair services with a focus on 
              customer satisfaction. Whether you need a quick screen replacement or a complete 
              website development project, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have a device that needs repair? Contact us today for a free diagnosis.
          </p>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Email: harryroger798@gmail.com
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Location: Barrackpore, West Bengal
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Monday - Saturday: 10:00 AM - 8:00 PM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-primary font-bold text-sm">BC</span>
              </div>
              <span className="text-xl font-bold">ByteCare</span>
            </div>
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} ByteCare. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
