import { NextRequest, NextResponse } from 'next/server';

let settings = {
  general: {
    siteName: 'Kaaya Beauty',
    siteDescription: 'Your ultimate destination for beauty and cosmetics',
    contactEmail: 'support@kaaya.com',
    contactPhone: '+91 9876543210',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    lowStockAlerts: true,
    newCustomerAlerts: true,
    dailyReports: true,
    weeklyReports: false
  },
  payment: {
    razorpay: {
      enabled: true,
      keyId: 'rzp_test_***',
      keySecret: '***'
    },
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: ''
    },
    stripe: {
      enabled: false,
      publishableKey: '',
      secretKey: ''
    },
    cod: {
      enabled: true,
      minAmount: 0,
      maxAmount: 5000
    }
  },
  shipping: {
    freeShippingThreshold: 999,
    standardShipping: {
      enabled: true,
      rate: 99,
      estimatedDays: '3-7'
    },
    expressShipping: {
      enabled: true,
      rate: 199,
      estimatedDays: '1-2'
    },
    zones: [
      { name: 'Metro Cities', rate: 99, days: '2-4' },
      { name: 'Tier 2 Cities', rate: 149, days: '4-7' },
      { name: 'Remote Areas', rate: 199, days: '7-14' }
    ]
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAttempts: 5,
    passwordExpiry: 90,
    requireStrongPassword: true
  }
};

export async function GET() {
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(request: NextRequest) {
  try {
    const newSettings = await request.json();
    settings = { ...settings, ...newSettings };
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}