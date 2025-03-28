import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, LogOut, UserRound, Eraser } from 'lucide-react';
import { requireAuth } from "../lib/auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
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
import { getCache, setCache } from "../lib/localStorageCache";
const CACHE_KEY = "subscriptionStatus";
const CACHE_TTL = process.env.NEXT_PUBLIC_CACHE_TTL;

const Account = ({ userEmail }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
    const [showConfirmDeleteAccountDialog, setShowConfirmDeleteAccountDialog] = useState(false);
    const [showDeleteAccountErrorDialog, setShowDeleteAccountErrorDialog] = useState(false);
    const [subscription, setSubscription] = useState({
        tier: "free",
        expiryDate: null,
        isRenewing: false,
    });
    const [name, setName] = useState("");
    
    const plans = [
        {
            name: "free",
            price: "$0/month",
            features: [
                "Limited analysis requests",
            ],
            current: subscription.tier === "free",
        },
        {
            name: "plus",
            price: "$3/month",
            features: [
                "Increased analysis requests",
            ],
            current: subscription.tier === "plus",
        },
    ];

    useEffect(() => {
        async function fetchSubscription() {
          try {
            // Try loading cached subscription first
            const cached = getCache(CACHE_KEY);
            console.log(`cached: ${cached}`);
            if (cached) {
              setSubscription(cached);
              setLoading(false);
              return; // We have valid, unexpired data—stop here!
            }
    
            // Otherwise, fetch from server
            const response = await fetch("/api/get-subscription-status");
            const data = await response.json();
    
            if (response.ok) {
              setSubscription({
                tier: data.tier || "free",
                expiryDate: data.expiryDate || null,
                isRenewing: data.isRenewing || false,
              });
              // Store data in localStorage with a TTL (in minutes)
              setCache(CACHE_KEY, {
                tier: data.tier || "free",
                expiryDate: data.expiryDate || null,
                isRenewing: data.isRenewing || false
              }, CACHE_TTL * 60 * 1000); // 5 minutes
            } else {
              console.error("Failed to fetch subscription status:", data.error);
            }
          } catch (error) {
            console.error("Error fetching subscription status:", error);
          } finally {
            setLoading(false);
          }
        }
        const fetchSession = async () => {
            const session = await getSession();
            if (session && session.user.name) {
              setName(session.user.name);
            }
          };
    
        fetchSubscription();
        fetchSession();
      }, []);

    const handleUpgrade = async () => {
        try {
            const response = await fetch("/api/switch-tier", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "upgrade" }),
            });
            const data = await response.json();
            if (response.ok) {
                window.location.href = data.url;
            } else {
                console.error("Failed to upgrade:", data.error);
            }
        } catch (error) {
            console.error("Error upgrading to plus tier:", error);
        }
    };

    const handleCancelRenewal = async () => {
        try {
            const response = await fetch("/api/switch-tier", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cancel-renewal" }),
            });
            const data = await response.json();
            if (response.ok) {
                setSubscription({
                    ...subscription,
                    isRenewing: false,
                });
                setShowDowngradeDialog(false);
            } else {
                console.error("Failed to cancel renewal:", data.error);
            }
        } catch (error) {
            console.error("Error canceling subscription renewal:", error);
        }
    };

    const handleLogout = () => {
        setShowLogoutDialog(false);
        signOut({ callbackUrl: "/login" });
    };

    const handleTryToDeleteAccount = async () => {
        setShowDeleteAccountDialog(false);
        setShowConfirmDeleteAccountDialog(true);
    };

    const handleDeleteAccount = async () => {
        setShowConfirmDeleteAccountDialog(false);
        setShowDeleteAccountErrorDialog(true);
    };

    return (
        <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono p-6">
            <div className="max-w-full mx-auto space-y-8">
                <h1 className="text-2xl mb-8 flex items-center space-x-3">
                    <ArrowLeft
                        className="w-6 h-6 text-neutral-400 hover:text-neutral-300 cursor-pointer"
                        onClick={() => router.push("/")}
                    />
                    <span>Settings</span>
                </h1>

                <div className="space-y-6">
                    <h2 className="text-lg text-neutral-400">profile</h2>
                    <div className="bg-neutral-800/50 p-4 rounded-lg flex items-center space-x-3 border border-neutral-700">
                        <UserRound className="w-5 h-5 text-neutral-500" />
                        <span>{name || "Loading..."}</span>
                    </div>
                    <div className="bg-neutral-800/50 p-4 rounded-lg flex items-center space-x-3 border border-neutral-700">
                        <Mail className="w-5 h-5 text-neutral-500" />
                        <span>{userEmail || "Loading..."}</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg text-neutral-400">subscription</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="text-center text-neutral-400 col-span-2">Loading...</div>
                        ) : (
                            plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`bg-neutral-800/50 p-6 rounded-lg border ${plan.current ? 'border-neutral-400' : 'border-neutral-700'} space-y-4`}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg capitalize">{plan.name}</h3>
                                        {plan.current && (
                                            <span className="text-sm text-gray-400">current plan</span>
                                        )}
                                    </div>
                                    <div className="text-2xl font-bold">{plan.price}</div>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-2">
                                                <CheckCircle2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                                <span className="text-sm text-neutral-400">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {plan.name === "plus" && subscription.tier === "plus" && subscription.expiryDate && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-neutral-400">
                                                    {subscription.isRenewing ? "Renewal Date:" : "Expiry Date:"}
                                                </span>
                                                <span>{new Date(subscription.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                            {subscription.isRenewing && (
                                                <button
                                                    className="w-full bg-neutral-700 p-3 rounded mt-2 hover:bg-neutral-600 transition-colors"
                                                    onClick={() => setShowDowngradeDialog(true)}
                                                >
                                                    Cancel Subscription
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {!plan.current && plan.name === "plus" && (
                                        <button
                                            className="w-full mt-4 bg-neutral-700 p-3 rounded-lg flex items-center justify-between hover:bg-neutral-600 transition-colors"
                                            onClick={handleUpgrade}
                                        >
                                            <span>Upgrade</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            
            
               <div className="space-y-6 pt-4">
                <div className="">
                    <button
                        onClick={() => setShowDeleteAccountDialog(true)}
                        className="w-full bg-neutral-800/50 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors border border-neutral-700"
                    >
                        <Eraser className="w-5 h-5" />
                        <span>delete account</span>
                    </button>
                </div>
                <div className="">
                    <button
                        onClick={() => setShowLogoutDialog(true)}
                        className="w-full bg-neutral-800/50 p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors border border-neutral-700"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>logout</span>
                    </button>
                </div>
                </div>
            </div>

            {/* Cancel Subscription Renewal Dialogue */}
            <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
                <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-300">Cancel Subscription Renewal</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Are you sure you want to cancel the renewal of your subscription? You will keep your benefits until the end of your subscription period.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
                            onClick={() => setShowDowngradeDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-700 hover:bg-red-600 text-neutral-300"
                            onClick={handleCancelRenewal}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Logout Dialogue */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-300">Confirm Logout</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Are you sure you want to log out of your account?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-green-900 hover:bg-green-800 text-neutral-300 border border-green-80"
                            onClick={handleLogout}
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account Dialogue */}
            <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
                <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-300">Confirm Account Deletion</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Are you sure you want to delete of your account? This will delete all your journal entries and account data. If you have an existing subscription, you will lose it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
                            onClick={() => setShowDeleteAccountDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-900 hover:bg-red-800 text-neutral-300 border border-red-80"
                            onClick={handleTryToDeleteAccount}
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account Confirmation Dialogue */}
            <AlertDialog open={showConfirmDeleteAccountDialog} onOpenChange={setShowConfirmDeleteAccountDialog}>
                <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-300">Confirm Account Deletion (are you sure?)</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Are you really sure you want to delete of your account? This is permanent. This will delete all your journal entries and account data. If you have an existing subscription, you will lose it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
                            onClick={() => setShowConfirmDeleteAccountDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-900 hover:bg-red-800 text-neutral-300 border border-red-80"
                            onClick={handleDeleteAccount}
                        >
                            Really Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

             {/* Delete Account Error Dialogue */}
             <AlertDialog open={showDeleteAccountErrorDialog} onOpenChange={setShowDeleteAccountErrorDialog}>
                <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-300">Error</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            There was an error deleting your account. Please try again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
                            onClick={() => setShowDeleteAccountErrorDialog(false)}
                        >
                            Back
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

// Redirect users to login page if not signed in
export async function getServerSideProps(context) {
    return requireAuth(context);
  }
  

export default Account;