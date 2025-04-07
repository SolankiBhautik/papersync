'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    invoiceNo: 'MA/',
    date: new Date().toISOString().split('T')[0],
    accountingFees: '0',
    taxConsultancy: '0',
    consultancyFees: '0',
    taxationFees: '0',
    otherCharges: '0',
    paymentType: '',
    paymentDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const responseData = await response.json()
        window.open(`/api/generate-pdf?id=${responseData.id}`, "_blank");
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Invoice Entry Form</h1>
          <Link 
            href="/listings" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            View All Entries
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-800 p-6 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Invoice No.</label>
              <input
                type="text"
                required
                placeholder="MA/"
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.invoiceNo}
                onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                required
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            {/* Fees Section */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Accounting Fees (Year Ended 22-23)
              </label>
              <input
                type="number"
                required
                step="1"
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.accountingFees}
                onChange={(e) => setFormData({...formData, accountingFees: (e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tax Consultancy Charges (Year Ended 22-23)
              </label>
              <input
                type="number"
                required
                step="1"
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.taxConsultancy}
                onChange={(e) => setFormData({...formData, taxConsultancy: (e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Accounting Consultancy Fees
              </label>
              <input
                type="number"
                required
                step="1"
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.consultancyFees}
                onChange={(e) => setFormData({...formData, consultancyFees: (e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Taxation Matter Fees (IT Return Filling Fees AY 23-24)
              </label>
              <input
                type="number"
                required
                step="1"
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.taxationFees}
                onChange={(e) => setFormData({...formData, taxationFees: (e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Other Professional Charges (Monthly Stock Statement)
              </label>
              <input
                type="number"
                required
                step="1"
                className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
                value={formData.otherCharges}
                onChange={(e) => setFormData({...formData, otherCharges: (e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Type
            </label>
            <select
              className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
              value={formData.paymentType}
              onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
              >
              <option value="">None</option>
              <option value="cash">cash</option>
              <option value="online">online</option>
              </select>
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Payment Received Date</label>
            <input
              type="date"
              required
              className="w-full bg-zinc-700 border border-gray-600 rounded-md p-2 text-white"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>
          
 
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Save & Generate PDF
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
