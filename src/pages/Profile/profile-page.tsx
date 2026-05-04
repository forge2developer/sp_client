import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { XIcon, CameraIcon, UserIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "Firstname",
    lastName: "Lastname",
    email: "Email",
    phone: "1234567890",
  })

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-xs text-muted-foreground mt-1">Manage your account information and security preferences.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all active:scale-95"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <div className="flex flex-col items-center">
            <TabsList className="inline-flex bg-muted p-1 h-11 rounded-lg mb-8">
              <TabsTrigger
                value="account"
                className="px-8 rounded-md py-1.5 text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm"
              >
                Account Information
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="px-8 rounded-md py-1.5 text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Security & Password
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="account" className="animate-in slide-in-from-bottom-4 duration-500 mt-0">
            <div className="flex flex-col items-center space-y-8">

              {/* Centered Avatar */}
              {/* <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-1.5 bg-primary/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-700"></div>
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl relative ring-1 ring-primary/20 transition-transform group-hover:scale-[1.02]">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <UserIcon className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                    <CameraIcon className="text-white h-8 w-8 mb-1" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">Update</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Profile Picture</p>
              </div> */}

              {/* Centered Form */}
              <div className="w-full space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: "firstName", label: "First name", value: formData.firstName },
                    { id: "lastName", label: "Last name", value: formData.lastName },
                    { id: "email", label: "Email address", value: formData.email, type: "email" },
                    { id: "phone", label: "Phone number", value: formData.phone },
                  ].map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <Label htmlFor={field.id} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">
                        {field.label}
                      </Label>
                      <Input
                        id={field.id}
                        type={field.type || "text"}
                        value={field.value}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="h-10 px-4 bg-muted/20 border-border focus:ring-2 focus:ring-primary/10 transition-all rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button className="h-10 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg shadow-md shadow-primary/10 transition-all active:scale-[0.98]">
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 px-8 font-semibold text-muted-foreground hover:text-foreground"
                    onClick={() => setFormData({
                      firstName: "Firstname",
                      lastName: "Lastname",
                      email: "Email",
                      phone: "1234567890",
                    })}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="animate-in slide-in-from-bottom-4 duration-500 mt-0">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xl space-y-8">
                <div className="flex flex-col items-center text-center space-y-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CameraIcon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Password Security</h3>
                    <p className="text-xs text-muted-foreground">Keep your account safe with a strong password.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-10 bg-muted/20 border-border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">New Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-10 bg-muted/20 border-border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Confirm Password</Label>
                      <Input type="password" placeholder="••••••••" className="h-10 bg-muted/20 border-border rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <Button className="h-10 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg shadow-md transition-all active:scale-[0.98]">
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
