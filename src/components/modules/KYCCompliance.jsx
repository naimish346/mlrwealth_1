import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Upload,
  RefreshCw,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store/appStore';

const getKYCStatusBadge = (status) => {
  switch (status) {
    case 'Verified':
      return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    case 'Pending':
      return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'Expired':
      return <Badge variant="error"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    case 'Rejected':
      return <Badge variant="error"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const kycLogs = [
  { id: 1, client: 'Amit Patel', action: 'KRA Verification', provider: 'CVL', status: 'Success', timestamp: '2024-01-15 10:30:00' },
  { id: 2, client: 'Sunita Patel', action: 'CKYC Fetch', provider: 'CAMS', status: 'Success', timestamp: '2024-01-15 09:45:00' },
  { id: 3, client: 'Neha Gupta', action: 'KRA Verification', provider: 'NDML', status: 'Pending', timestamp: '2024-01-15 08:20:00' },
  { id: 4, client: 'Sharma HUF', action: 'FATCA Declaration', provider: 'Internal', status: 'Success', timestamp: '2024-01-14 16:00:00' },
];

export const KYCCompliance = () => {
  const { clients } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showIPVModal, setShowIPVModal] = useState(false);

  const pendingKYC = clients.filter(c => c.kycStatus === 'Pending');
  const expiredKYC = clients.filter(c => c.kycStatus === 'Expired');
  const verifiedKYC = clients.filter(c => c.kycStatus === 'Verified');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.pan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KYC & Compliance</h1>
          <p className="text-slate-500">Manage KYC status, FATCA/CRS, and compliance requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync KRA
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{verifiedKYC.length}</p>
                <p className="text-sm text-slate-500">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingKYC.length}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{expiredKYC.length}</p>
                <p className="text-sm text-slate-500">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{clients.filter(c => c.fatcaCompliant).length}</p>
                <p className="text-sm text-slate-500">FATCA Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Expiry Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            KYC Expiry Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {clients.filter(c => c.kycExpiryDate).slice(0, 3).map(client => (
              <div key={client.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-medium">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <p className="text-sm text-slate-500">Expires: {client.kycExpiryDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">90 days</Badge>
                  <Button variant="outline" size="sm">Send Reminder</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client KYC Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client KYC Status</CardTitle>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search clients..."
                icon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>PAN</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>CKYC</TableHead>
              <TableHead>FATCA</TableHead>
              <TableHead>CRS</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map(client => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-sm">
                      {client.name.charAt(0)}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">XXXX{client.pan.slice(-4)}</TableCell>
                <TableCell>{getKYCStatusBadge(client.kycStatus)}</TableCell>
                <TableCell>
                  {client.ckyc ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="default">Not Found</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={client.fatcaCompliant ? 'success' : 'error'}>
                    {client.fatcaCompliant ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={client.crsCompliant ? 'success' : 'error'}>
                    {client.crsCompliant ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>{client.kycExpiryDate || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowIPVModal(true)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* KRA API Logs */}
      <Card>
        <CardHeader>
          <CardTitle>KRA API Logs</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kycLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.client}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  <Badge variant="info">{log.provider}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={log.status === 'Success' ? 'success' : 'warning'}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* IPV Modal */}
      <Modal isOpen={showIPVModal} onClose={() => setShowIPVModal(false)} title="In-Person Verification (IPV)">
        <div className="space-y-6">
          <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-lg">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-4">Capture IPV photo or upload document</p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <Button>
                Capture Live
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Verification Date</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Verified By</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="RM Name" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowIPVModal(false)}>Cancel</Button>
            <Button onClick={() => setShowIPVModal(false)}>Complete IPV</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
