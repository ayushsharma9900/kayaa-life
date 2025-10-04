import { NextRequest, NextResponse } from 'next/server';

let orders = [
  {
    id: '1',
    orderNumber: 'ORD001',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+91 9876543210'
    },
    items: [
      {
        id: '1',
        name: 'MAC Lipstick - Ruby Woo',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        price: 1950,
        quantity: 1
      }
    ],
    total: 1950,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '123 Beauty Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    orderDate: '2024-02-20T10:30:00Z',
    updatedAt: '2024-02-22T14:15:00Z'
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    customer: {
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+91 9876543211'
    },
    items: [
      {
        id: '2',
        name: 'The Ordinary Niacinamide 10% + Zinc 1%',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        price: 700,
        quantity: 2
      }
    ],
    total: 1400,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '456 Skincare Ave',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    orderDate: '2024-02-19T09:45:00Z',
    updatedAt: '2024-02-21T16:20:00Z'
  },
  {
    id: '3',
    orderNumber: 'ORD003',
    customer: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543212'
    },
    items: [
      {
        id: '3',
        name: 'Urban Decay Naked3 Eyeshadow Palette',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
        price: 3200,
        quantity: 1
      }
    ],
    total: 3200,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '789 Makeup Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    orderDate: '2024-02-18T11:15:00Z',
    updatedAt: '2024-02-20T13:30:00Z'
  },
  {
    id: '4',
    orderNumber: 'ORD004',
    customer: {
      name: 'Jessica Wilson',
      email: 'jessica.wilson@email.com',
      phone: '+91 9876543213'
    },
    items: [
      {
        id: '4',
        name: 'Lakme Perfect Radiance Facewash',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        price: 175,
        quantity: 3
      }
    ],
    total: 525,
    status: 'confirmed',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '321 Beauty Plaza',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India'
    },
    orderDate: '2024-02-17T08:20:00Z',
    updatedAt: '2024-02-19T12:45:00Z'
  },
  {
    id: '5',
    orderNumber: 'ORD005',
    customer: {
      name: 'Ariana Patel',
      email: 'ariana.patel@email.com',
      phone: '+91 9876543214'
    },
    items: [
      {
        id: '5',
        name: 'Maybelline Fit Me Foundation',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        price: 599,
        quantity: 1
      }
    ],
    total: 599,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: {
      street: '654 Fashion St',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India'
    },
    orderDate: '2024-02-16T15:10:00Z',
    updatedAt: '2024-02-18T10:25:00Z'
  }
];

export async function GET() {
  return NextResponse.json({ success: true, data: orders });
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ success: true, data: orders[orderIndex] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}