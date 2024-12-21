import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';
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

const Account = ({ userEmail }) => {
    const router = useRouter();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
    const [subscription, setSubscription] = useState({
        tier: "free",
        expiryDate: null,
        isRenewing: false,
    });

    const plans = [
        {
            name: "free",
            price: "$0/month",
            features: [
                "Unlimited journal entries",
                "Basic AI analysis",
                "Limited analysis requests",
            ],
            current: subscription.tier === "free",
        },
        {
            name: "plus",
            price: "$5/month",
            features: [
                "Unlimited journal entries",
                "Advanced AI analysis",
                "Increased analysis requests",
            ],
            current: subscription.tier === "plus",
        },
    ];

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            try {
                const response = await fetch("/api/get-subscription-status");
                const data = await response.json();
                if (response.ok) {
                    setSubscription({
                        tier: data.tier || "free",
                        expiryDate: data.expiryDate || null,
                        isRenewing: data.isRenewing || false,
                    });
                } else {
                    console.error("Failed to fetch subscription status:", data.error);
                }
            } catch (error) {
                console.error("Error fetching subscription status:", error);
            }
        };

        fetchSubscriptionStatus();
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
                window.location.href = data.url; // Redirect to Stripe checkout
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
                    isRenewing: false, // Indicate that auto-renewal is canceled
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
        console.log('Logging out...');
        setShowLogoutDialog(false);
        signOut({ callbackUrl: "/login" }); // Log out and redirect to the home page
    };

    return (
        <div className="bg-gray-900 min-h-screen text-gray-300 font-mono p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <h1 className="text-2xl mb-8 flex items-center space-x-3">
                    <ArrowLeft
                        className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer"
                        onClick={() => router.push("/")}
                    />
                    <span>Account</span>
                </h1>

                {/* Account Info Section */}
                <div className="space-y-6">
                    <h2 className="text-lg text-gray-400">profile</h2>
                    <div className="bg-gray-800 p-4 rounded flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span>{userEmail || "Loading..."}</span>
                    </div>
                </div>

                {/* Subscription Info Section */}
                <div className="space-y-6">
                    <h2 className="text-lg text-gray-400">subscription</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`bg-gray-800 p-6 rounded-lg border ${plan.current ? 'border-blue-500' : 'border-gray-700'
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
                                {plan.name === "plus" && subscription.tier === "plus" && subscription.expiryDate && (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">
                                                {subscription.isRenewing ? "Renewal Date:" : "Expiry Date:"}
                                            </span>
                                            <span>{new Date(subscription.expiryDate).toLocaleDateString()}</span>
                                        </div>
                                        {subscription.isRenewing && (
                                            <button
                                                className="w-full bg-red-700 p-3 rounded mt-2 hover:bg-red-600 transition-colors"
                                                onClick={() => setShowDowngradeDialog(true)}
                                            >
                                                Cancel Renewal
                                            </button>
                                        )}
                                    </div>
                                )}
                                {!plan.current && plan.name === "plus" && (
                                    <button
                                        className="w-full mt-4 bg-gray-700 p-3 rounded flex items-center justify-between hover:bg-gray-600 transition-colors"
                                        onClick={handleUpgrade}
                                    >
                                        <span>Upgrade</span>
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

            {/* Cancel Renewal Confirmation Dialog */}
            <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
                <AlertDialogContent className="bg-gray-800 text-gray-300 border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-300">Cancel Subscription Renewal</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to cancel the renewal of your subscription? You will keep your benefits until the end of your subscription period.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                            onClick={() => setShowDowngradeDialog(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-700 hover:bg-red-600 text-gray-300"
                            onClick={handleCancelRenewal}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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

export async function getServerSideProps(context) {
    const { getSession } = await import("next-auth/react");
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    return {
        props: {
            userEmail: session.user.email,
        },
    };
}

export default Account;