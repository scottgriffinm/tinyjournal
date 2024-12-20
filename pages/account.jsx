import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "../components/ui/alert-dialog";

const Account = () => {
    const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Mock user data - would come from your auth context/API
  const user = {
    email: "scott@example.com",
    currentPlan: "free",
    aiCreditsUsed: 42,
    aiCreditsTotal: 50
  };

  const plans = [
    {
      name: "free",
      price: "$0/month",
      features: [
        "Unlimited journal entries",
        "Basic AI analysis",
        "Limited analysis interactions",
      ],
      current: user.currentPlan === "free"
    },
    {
      name: "plus",
      price: "$7/month",
      features: [
        "Unlimited journal entries",
        "Advanced AI analysis",
        "Increased analysis interactions",
      ],
      current: user.currentPlan === "plus"
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
    setShowLogoutDialog(false);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300 font-mono p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <h1 className="text-2xl mb-8 flex items-center space-x-3">
   <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer" onClick={() => router.push("/")} />
          
          <span>Account</span>
        </h1>

        {/* Account Info Section */}
        <div className="space-y-6">
          <h2 className="text-lg text-gray-400">profile</h2>
          <div className="bg-gray-800 p-4 rounded flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-500" />
            <span>{user.email}</span>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-6">
          <h2 className="text-lg text-gray-400">subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-gray-800 p-6 rounded-lg border ${
                  plan.current ? 'border-blue-500' : 'border-gray-700'
                } space-y-4`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg capitalize">{plan.name}</h3>
                  {plan.current && (
                    <span className="text-sm text-blue-400">current plan</span>
                  )}
                </div>
                <div className="text-2xl font-bold">{plan.price}</div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <button className="w-full mt-4 bg-gray-700 p-3 rounded flex items-center justify-between hover:bg-gray-600 transition-colors">
                    <span>{plan.name === "free" ? "downgrade" : "upgrade"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-8">
          <button 
            onClick={() => setShowLogoutDialog(true)}
            className="w-full bg-gray-800 p-4 rounded flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-gray-800 text-gray-300 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-300">confirm logout</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              are you sure you want to logout of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
              onClick={() => setShowLogoutDialog(false)}
            >
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gray-700 hover:bg-gray-600 text-gray-300"
              onClick={handleLogout}
            >
              logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Account;