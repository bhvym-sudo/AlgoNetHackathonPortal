'use client';

import { useState } from 'react';

export default function NewTeamRegistration() {
  const [form, setForm] = useState({
    leaderName: '',
    leaderEnrollment: '',
    leaderMobile: '',
    leaderEmail: '', // Added email field for leader
    member2Name: '',
    member2Enrollment: '',
    member2Email: '', // Added email field for member 2
    member3Name: '',
    member3Enrollment: '',
    member3Email: '', // Added email field for member 3
    member4Name: '',
    member4Enrollment: '',
    member4Email: '' // Added email field for member 4
  });

  const [submitted, setSubmitted] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!form.leaderName.trim()) newErrors.leaderName = "Leader name is required";
    if (!form.leaderEnrollment.trim()) newErrors.leaderEnrollment = "Leader enrollment ID is required";
    if (!form.leaderMobile.trim()) newErrors.leaderMobile = "Leader mobile number is required";
    if (!form.leaderEmail.trim()) newErrors.leaderEmail = "Leader email is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.leaderEmail && !emailRegex.test(form.leaderEmail)) {
      newErrors.leaderEmail = "Please enter a valid email address";
    }
    if (form.member2Email && !emailRegex.test(form.member2Email)) {
      newErrors.member2Email = "Please enter a valid email address";
    }
    if (form.member3Email && !emailRegex.test(form.member3Email)) {
      newErrors.member3Email = "Please enter a valid email address";
    }
    if (form.member4Email && !emailRegex.test(form.member4Email)) {
      newErrors.member4Email = "Please enter a valid email address";
    }
    
    // Mobile number validation
    const mobileRegex = /^\d{10}$/;
    if (form.leaderMobile && !mobileRegex.test(form.leaderMobile)) {
      newErrors.leaderMobile = "Please enter a valid 10-digit mobile number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const sendConfirmationEmails = async (teamId) => {
    const emails = [
      form.leaderEmail,
      form.member2Email,
      form.member3Email,
      form.member4Email
    ].filter(email => email.trim() !== '');

    try {
      const res = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          teamId,
          teamName: `${form.leaderName}'s Team`,
          members: [
            { name: form.leaderName, role: 'Leader' },
            form.member2Name ? { name: form.member2Name, role: 'Member' } : null,
            form.member3Name ? { name: form.member3Name, role: 'Member' } : null,
            form.member4Name ? { name: form.member4Name, role: 'Member' } : null,
          ].filter(Boolean)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEmailStatus('success');
      } else {
        setEmailStatus('error');
        console.error('Email sending failed:', data);
      }
    } catch (error) {
      setEmailStatus('error');
      console.error('Email sending error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/newteam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        const teamId = data.teamId;
        setTeamId(teamId);
        await sendConfirmationEmails(teamId);
        setSubmitted(true);
      } else {
        setErrors({ submit: data.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">Your team has been registered successfully.</p>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-gray-600 text-sm mb-1">Your Team ID</p>
            <p className="text-2xl font-mono font-bold text-green-600">{teamId}</p>
            <p className="text-gray-500 text-xs mt-2">Please save this ID for future reference</p>
          </div>
          
          {emailStatus === 'success' && (
            <div className="bg-green-50 p-3 rounded-md mb-6 text-sm text-green-700 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Confirmation emails with your team ID have been sent to all team members.
            </div>
          )}
          
          {emailStatus === 'error' && (
            <div className="bg-yellow-50 p-3 rounded-md mb-6 text-sm text-yellow-700 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              We couldn't send confirmation emails to some team members. Please make sure to save your team ID.
            </div>
          )}
          
          <button onClick={() => setSubmitted(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition duration-150">
            Register Another Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Team Registration</h1>
            <p className="text-blue-100 mt-1">Fill out the form below to register your team</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
                Team Leader Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="leaderName" className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                  <input 
                    id="leaderName"
                    name="leaderName" 
                    placeholder="Enter full name" 
                    className={`w-full p-2 border text-black rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition ${errors.leaderName ? 'border-red-500' : 'border-gray-300'}`} 
                    onChange={handleChange}
                    value={form.leaderName}
                  />
                  {errors.leaderName && <p className="mt-1 text-sm text-red-600">{errors.leaderName}</p>}
                </div>
                <div>
                  <label htmlFor="leaderEnrollment" className="block text-sm font-medium text-gray-700 mb-1">Enrollment ID*</label>
                  <input 
                    id="leaderEnrollment"
                    name="leaderEnrollment" 
                    placeholder="Enter enrollment ID" 
                    className={`w-full p-2 border text-black rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition ${errors.leaderEnrollment ? 'border-red-500' : 'border-gray-300'}`} 
                    onChange={handleChange}
                    value={form.leaderEnrollment}
                  />
                  {errors.leaderEnrollment && <p className="mt-1 text-sm text-red-600">{errors.leaderEnrollment}</p>}
                </div>
                <div>
                  <label htmlFor="leaderMobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number*</label>
                  <input 
                    id="leaderMobile"
                    name="leaderMobile" 
                    placeholder="10-digit mobile number" 
                    className={`w-full p-2 border rounded text-black focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition ${errors.leaderMobile ? 'border-red-500' : 'border-gray-300'}`} 
                    onChange={handleChange}
                    value={form.leaderMobile}
                  />
                  {errors.leaderMobile && <p className="mt-1 text-sm text-red-600">{errors.leaderMobile}</p>}
                </div>
                <div>
                  <label htmlFor="leaderEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                  <input 
                    id="leaderEmail"
                    name="leaderEmail" 
                    type="email"
                    placeholder="Enter email address" 
                    className={`w-full p-2 border text-black rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition ${errors.leaderEmail ? 'border-red-500' : 'border-gray-300'}`} 
                    onChange={handleChange}
                    value={form.leaderEmail}
                  />
                  {errors.leaderEmail && <p className="mt-1 text-sm text-red-600">{errors.leaderEmail}</p>}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span>
                Team Members
              </h2>
              
              {[2, 3, 4].map(memberNum => (
                <div key={memberNum} className="border-t border-gray-200 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Member {memberNum}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor={`member${memberNum}Name`} className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        id={`member${memberNum}Name`}
                        name={`member${memberNum}Name`} 
                        placeholder="Enter full name" 
                        className="w-full p-2 border text-black border-gray-300 rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" 
                        onChange={handleChange}
                        value={form[`member${memberNum}Name`]}
                      />
                    </div>
                    <div>
                      <label htmlFor={`member${memberNum}Enrollment`} className="block text-sm font-medium text-gray-700 mb-1">Enrollment ID</label>
                      <input 
                        id={`member${memberNum}Enrollment`}
                        name={`member${memberNum}Enrollment`} 
                        placeholder="Enter enrollment ID" 
                        className="w-full p-2 border text-black border-gray-300 rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition" 
                        onChange={handleChange}
                        value={form[`member${memberNum}Enrollment`]}
                      />
                    </div>
                    <div>
                      <label htmlFor={`member${memberNum}Email`} className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        id={`member${memberNum}Email`}
                        name={`member${memberNum}Email`} 
                        type="email"
                        placeholder="Enter email address" 
                        className={`w-full p-2 border text-black rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition ${errors[`member${memberNum}Email`] ? 'border-red-500' : 'border-gray-300'}`} 
                        onChange={handleChange}
                        value={form[`member${memberNum}Email`]}
                      />
                      {errors[`member${memberNum}Email`] && <p className="mt-1 text-sm text-red-600">{errors[`member${memberNum}Email`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Register Team'}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Fields marked with * are required
        </p>
      </div>
    </div>
  );
}