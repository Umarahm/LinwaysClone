"use client"

import * as React from "react"
import { Calendar, Download, FileText, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Assignment {
  id: number
  title: string
  course: string
  dueDate: string
  status: "submitted" | "not_submitted"
  submissionUrl?: string
  grade?: number
}

interface AssignmentsPageProps {
  assignments: Assignment[]
}

export function AssignmentsPage({ assignments }: AssignmentsPageProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploadingId, setUploadingId] = React.useState<number | null>(null)

  const handleFileUpload = async (assignmentId: number) => {
    if (!selectedFile) return

    setUploadingId(assignmentId)

    // Simulate file upload
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In real implementation, upload to server
    console.log(`Uploading file for assignment ${assignmentId}:`, selectedFile.name)

    setUploadingId(null)
    setSelectedFile(null)
  }

  const submittedCount = assignments.filter((a) => a.status === "submitted").length
  const pendingCount = assignments.filter((a) => a.status === "not_submitted").length

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-1">Track and submit your course assignments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Assignments</p>
                <p className="text-3xl font-bold">{assignments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Submitted</p>
                <p className="text-3xl font-bold">{submittedCount}</p>
              </div>
              <Upload className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="w-5 h-5 text-blue-600" />
            Assignment List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignment.course}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={assignment.status === "submitted" ? "default" : "destructive"}>
                      {assignment.status === "submitted" ? "Submitted" : "Not Submitted"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {assignment.grade ? (
                      <Badge variant="secondary">{assignment.grade}/100</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {assignment.status === "submitted" ? (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Upload Assignment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">{assignment.title}</h4>
                                <p className="text-sm text-gray-600">{assignment.course}</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="file">Select File</Label>
                                <Input
                                  id="file"
                                  type="file"
                                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                  accept=".pdf,.doc,.docx,.zip"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  onClick={() => handleFileUpload(assignment.id)}
                                  disabled={!selectedFile || uploadingId === assignment.id}
                                >
                                  {uploadingId === assignment.id ? "Uploading..." : "Upload"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
