"use client"
import { Calendar, CheckCircle, TrendingUp, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AttendanceRecord {
  id: number
  date: string
  course_name: string
  course_code: string
  status: "present" | "absent"
}

interface AttendanceSummary {
  course_code: string
  course_name: string
  present_count: number
  total_count: number
  percentage: number
}

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[]
  attendanceSummary: AttendanceSummary[]
}

export function AttendanceView({ attendanceRecords, attendanceSummary }: AttendanceViewProps) {
  const overallPercentage =
    attendanceSummary.length > 0
      ? Math.round(attendanceSummary.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceSummary.length)
      : 0

  const totalPresent = attendanceSummary.reduce((acc, curr) => acc + curr.present_count, 0)
  const totalClasses = attendanceSummary.reduce((acc, curr) => acc + curr.total_count, 0)

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your class attendance across all courses</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Overall Attendance</p>
                <p className="text-3xl font-bold">{overallPercentage}%</p>
                <p className="text-blue-100 text-xs mt-1">Average across all courses</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Classes Attended</p>
                <p className="text-3xl font-bold">{totalPresent}</p>
                <p className="text-emerald-100 text-xs mt-1">Out of {totalClasses} total</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Classes Missed</p>
                <p className="text-3xl font-bold">{totalClasses - totalPresent}</p>
                <p className="text-amber-100 text-xs mt-1">Absent days</p>
              </div>
              <XCircle className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course-wise Attendance Summary */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Course-wise Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendanceSummary.map((summary, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{summary.course_code}</span>
                  <span className="text-sm text-gray-600 ml-2">{summary.course_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{summary.percentage}%</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({summary.present_count}/{summary.total_count})
                  </span>
                </div>
              </div>
              <Progress value={summary.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Attendance Records */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="w-5 h-5 text-blue-600" />
            Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.course_code}</div>
                      <div className="text-sm text-gray-600">{record.course_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.status === "present" ? "default" : "destructive"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {record.status === "present" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {record.status === "present" ? "Present" : "Absent"}
                    </Badge>
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
