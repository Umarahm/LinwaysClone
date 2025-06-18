import { NotificationDemo } from "@/components/demo/notification-demo"

export default function NotificationDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🔔 Notification System Demo
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Test the interactive notification popover system designed for students and faculty.
                        Features real-time updates, role-based notifications, and intuitive interactions.
                    </p>
                </div>

                <NotificationDemo />

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Navigate to the student or faculty dashboard to see notifications in action
                    </p>
                </div>
            </div>
        </div>
    )
} 