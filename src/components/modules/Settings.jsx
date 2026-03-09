import { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useAppStore } from '../../store/appStore';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'compliance', label: 'Compliance', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Database },
];

export const Settings = () => {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your account and preferences</p>
        </div>
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            {settingsTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1e3a5f] text-white'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {currentUser?.name.charAt(0) || 'U'}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Photo</Button>
                      <p className="text-sm text-slate-500 mt-2">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" defaultValue={currentUser?.name} />
                    <Input label="Email" type="email" defaultValue={currentUser?.email} />
                    <Input label="Phone Number" type="tel" defaultValue="+91 9876543210" />
                    <Input label="Role" defaultValue={currentUser?.role} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Company Name" defaultValue="MLR Wealth Advisory" />
                    <Input label="SEBI Registration No." defaultValue="INH000XXXXXX" />
                    <Input label="Business Address" defaultValue="123 Financial District, Mumbai" />
                    <Input label="GST Number" defaultValue="27AABCU9603R1ZM" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg pr-10"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="New Password" type="password" />
                    <Input label="Confirm Password" type="password" />
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-700">
                      Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters. 
                      Password expires every 90 days as per compliance policy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">SMS/Email OTP</p>
                        <p className="text-sm text-slate-500">Receive OTP on registered mobile/email</p>
                      </div>
                    </div>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Current Session</p>
                        <p className="text-sm text-slate-500">Chrome on Windows • Mumbai, India</p>
                        <p className="text-xs text-slate-400 mt-1">Last active: Just now</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Sign Out All Other Sessions</Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'KYC Expiry Alerts', desc: 'Get notified before client KYC expires', enabled: true },
                  { label: 'SIP Reminders', desc: 'Notifications for upcoming SIP dates', enabled: true },
                  { label: 'Goal Status Updates', desc: 'Alerts when goal status changes', enabled: true },
                  { label: 'Transaction Confirmations', desc: 'Get notified for all transactions', enabled: false },
                  { label: 'Daily NAV Updates', desc: 'Receive daily NAV summary', enabled: false },
                  { label: 'Compliance Alerts', desc: 'Important compliance notifications', enabled: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1e3a5f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a5f]"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Compliance Settings */}
          {activeTab === 'compliance' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Audit Log Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-slate-900">Audit Log Retention</p>
                        <p className="text-sm text-slate-500">As per SEBI guidelines</p>
                      </div>
                      <Badge variant="info">7 Years</Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      All user actions, API calls, and data modifications are logged and retained for 7 years.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'TLS 1.2+ Encryption', status: 'Active', icon: Lock },
                    { label: 'Database Encryption', status: 'Active', icon: Database },
                    { label: 'PAN/Aadhaar Masking', status: 'Enabled', icon: Eye },
                    { label: 'Daily Encrypted Backups', status: 'Active', icon: Shield },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-slate-900">{item.label}</span>
                        </div>
                        <Badge variant="success">{item.status}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>API Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'MFAPI.in', desc: 'Daily NAV data', status: 'Connected', icon: Globe },
                  { name: 'AMFI', desc: 'Scheme master data', status: 'Connected', icon: Database },
                  { name: 'CVL KRA', desc: 'KYC verification', status: 'Connected', icon: Shield },
                  { name: 'CAMS KRA', desc: 'KYC verification', status: 'Connected', icon: Shield },
                  { name: 'NDML KRA', desc: 'KYC verification', status: 'Pending', icon: Shield },
                  { name: 'SMS Gateway', desc: 'OTP delivery', status: 'Connected', icon: Mail },
                  { name: 'Email Service', desc: 'AWS SES', status: 'Connected', icon: Mail },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={item.status === 'Connected' ? 'success' : 'warning'}>{item.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Key className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
