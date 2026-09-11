import { Order } from '../types';

export const SHIPROCKET_CONFIG = {
  accountEmail: 'mrbeast797996@gmail.com',
  pickupLocation: 'sartaj',
  pickupPincode: '110025',
  pickupCity: 'South Delhi',
  companyId: '11336654',
  companyName: 'Leovra Enterprises',
  dashboardUrl: 'https://app.shiprocket.in/',
  trackingBaseUrl: 'https://shiprocket.co/tracking/',
};

/**
 * Returns public Shiprocket tracking URL for an AWB code
 */
export const getShiprocketTrackingUrl = (awbCode: string): string => {
  if (!awbCode) return SHIPROCKET_CONFIG.dashboardUrl;
  return `${SHIPROCKET_CONFIG.trackingBaseUrl}${encodeURIComponent(awbCode.trim())}`;
};

export interface PincodeEstimation {
  isValid: boolean;
  estimatedDays: string;
  courierPartners: string[];
  isCodAvailable: boolean;
  message: string;
}

/**
 * Validates Indian pincode and provides realistic delivery estimation
 * based on Delhi 110025 pickup hub
 */
export const estimateDeliveryByPincode = (pincode: string): PincodeEstimation => {
  const clean = pincode.replace(/\D/g, '');
  if (clean.length !== 6) {
    return {
      isValid: false,
      estimatedDays: '',
      courierPartners: [],
      isCodAvailable: false,
      message: 'Please enter a valid 6-digit Indian pincode.',
    };
  }

  const prefix = clean.substring(0, 2);
  let days = '3 - 5 Business Days';

  // Delhi NCR / Northern region (Fastest)
  if (['11', '12', '13', '20'].includes(prefix)) {
    days = '1 - 2 Business Days (Express Delhi NCR)';
  } else if (['14', '15', '16', '24', '25', '28', '30'].includes(prefix)) {
    days = '2 - 3 Business Days (North India)';
  } else if (['40', '41', '50', '56', '60', '70'].includes(prefix)) {
    days = '3 - 4 Business Days (Metro Cities)';
  } else {
    days = '4 - 6 Business Days (Standard Pan-India)';
  }

  return {
    isValid: true,
    estimatedDays: days,
    courierPartners: ['Blue Dart', 'Delhivery', 'Shadowfax', 'DTDC'],
    isCodAvailable: true,
    message: `Delivery available in ${days} via Shiprocket Express Courier.`,
  };
};

/**
 * Generates and downloads a Shiprocket-compatible CSV for Bulk Order Import
 */
export const exportShiprocketCSV = (orders: Order[]) => {
  if (!orders || orders.length === 0) return;

  const headers = [
    'Order ID',
    'Order Date',
    'Channel',
    'Payment Method',
    'Customer Name',
    'Mobile Number',
    'Delivery Address',
    'City',
    'Pincode',
    'State',
    'Country',
    'Product Name',
    'SKU',
    'Quantity',
    'Unit Price',
    'Total Amount',
    'Pickup Location'
  ];

  const rows: string[] = [];

  orders.forEach((order) => {
    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
    const isCod = order.paymentMethod === 'Cash on Delivery';
    const pincodeMatch = (order.customerAddress || '').match(/\b\d{6}\b/);
    const pincode = pincodeMatch ? pincodeMatch[0] : '110001';
    const city = order.customerCity || 'New Delhi';

    order.items.forEach((item) => {
      const row = [
        `"${order.id}"`,
        `"${new Date(order.createdAt).toISOString().split('T')[0]}"`,
        `"Custom API - Leovra"`,
        `"${isCod ? 'COD' : 'Prepaid'}"`,
        `"${(order.customerName || 'Customer').replace(/"/g, '""')}"`,
        `"${cleanPhone}"`,
        `"${(order.customerAddress || '').replace(/"/g, '""')}"`,
        `"${city.replace(/"/g, '""')}"`,
        `"${pincode}"`,
        `"Delhi"`,
        `"India"`,
        `"${item.product.name.replace(/"/g, '""')} (${item.selectedSize})"`,
        `"${item.product.id}-${item.selectedSize}"`,
        `${item.quantity}`,
        `${item.product.price}`,
        `${order.totalAmount}`,
        `"${SHIPROCKET_CONFIG.pickupLocation}"`
      ];
      rows.push(row.join(','));
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Shiprocket_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
