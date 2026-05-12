import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { cn } from "@/lib/utils"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const names = user.name.split(" ")
      setFormData({
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      })
    }
  }, [user])

  const hashPassword = async (password: string) => {
    if (!window.crypto || !window.crypto.subtle) {
      return btoa(password);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus({ type: 'error', message: "Passwords do not match" })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setStatus({ type: 'error', message: "Password must be at least 6 characters" })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const token = localStorage.getItem("token")
      const hashedCurrent = await hashPassword(passwordData.currentPassword)
      const hashedNew = await hashPassword(passwordData.newPassword)

      await axios.post(`${API_URL}/api/users/change-password`, {
        currentPassword: hashedCurrent,
        newPassword: hashedNew,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setStatus({ type: 'success', message: "Password updated successfully" })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || "Failed to update password" 
      })
    } finally {
      setLoading(false)
    }
  }

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

        {status && (
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-lg border animate-in slide-in-from-top-2",
            status.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          )}>
            {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

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
              <div className="w-full space-y-6">
                <div className="grid grid-cols-1 gap-4 opacity-80">
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
                        disabled
                        className="h-10 px-4 bg-muted/20 border-border cursor-not-allowed text-sm font-medium"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2 pt-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Read Only Mode</p>
                    <p className="text-xs text-muted-foreground text-center max-w-xs">
                        Account details are managed by your administrator and cannot be modified here.
                    </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="animate-in slide-in-from-bottom-4 duration-500 mt-0">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xl space-y-8">
                <div className="flex flex-col items-center text-center space-y-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Password Security</h3>
                    <p className="text-xs text-muted-foreground">Keep your account safe with a strong password.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Current Password</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-10 bg-muted/20 border-border rounded-lg text-sm" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">New Password</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="h-10 bg-muted/20 border-border rounded-lg text-sm" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider">Confirm Password</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="h-10 bg-muted/20 border-border rounded-lg text-sm" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <Button 
                      onClick={handleUpdatePassword}
                      disabled={loading}
                      className="h-10 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
                    >
                      {loading ? "Updating..." : "Update Password"}
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
