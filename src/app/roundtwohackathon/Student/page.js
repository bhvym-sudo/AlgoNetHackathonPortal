'use client';
import { useState } from 'react';

export default function RoundTwoHackathon() {
  const [teamId, setTeamId] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const loadTeamData = async () => {
    if (!teamId.trim()) {
      setErrorMessage("Please enter a Team ID");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const res = await fetch(`/api/team?teamId=${teamId}`);
      const data = await res.json();
      
      if (data && data.teamId) {
        setTeamData(data);
      } else {
        setTeamData(null);
        setErrorMessage("Team not found");
      }
    } catch (err) {
      console.error("Failed to load team data", err);
      setErrorMessage("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'marks') {

      const marks = parseInt(value);
      if (isNaN(marks)) {
        setTeamData({ ...teamData, [name]: '' });
      } else {
        const validMarks = Math.min(100, Math.max(0, marks));
        setTeamData({ ...teamData, [name]: validMarks });
      }
    } else {
      setTeamData({ ...teamData, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTeamData({ ...teamData, [name]: checked });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Team evaluation saved successfully!");
        setTeamData(result.team || teamData);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Failed to save evaluation data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubmissionStatus = async () => {

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    

    const updatedData = {
      ...teamData,
      submitted: !teamData.submitted
    };
    setTeamData(updatedData);

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      const result = await res.json();
      
      if (result.error) {
        setErrorMessage(result.error);

        setTeamData({...teamData});
      } else {
        setSuccessMessage(`Team ${updatedData.submitted ? 'locked' : 'unlocked'} successfully!`);

        setTeamData(result.team || updatedData);
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
      setErrorMessage("Failed to update submission status.");

      setTeamData({...teamData});
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTeamId('');
    setTeamData(null);
    setErrorMessage('');
    setSuccessMessage('');
  };


  const hasMemberData = (name, enrollment) => {
    return (name && name.trim() !== '') || (enrollment && enrollment.trim() !== '');
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
        setErrorMessage("File size exceeds 10MB limit");
        e.target.value = null;
      } else {
        setUploadFile(file);
        setErrorMessage('');
      }
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !teamData?.teamId) {
      setErrorMessage("Please select a file and ensure team data is loaded");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('teamId', teamData.teamId);
    formData.append('teamName', teamData.teamName || teamData.leaderName);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          setIsUploading(false);
          
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setSuccessMessage("File uploaded successfully!");
            setUploadFile(null);
            // Reset file input
            document.getElementById('file-upload').value = '';
            
            // Show notification and reload immediately after user dismisses it
            alert("Your files have been uploaded successfully!");
            window.location.reload();
            
            // Remove the timeout since we're reloading immediately
            // setTimeout(() => {
            //   window.location.reload();
            // }, 1500);
          } else {
            setErrorMessage("Failed to upload file");
          }
        }
      };

      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage("Failed to upload file");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">AlgoNet Hackathon - Round Two Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Team ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter Team ID"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={loadTeamData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 border-2 border-t-transparent border-white animate-spin"></span>
                  </span>
                  <span>Loading...</span>
                </>
              ) : (
                "Load Team"
              )}
            </button>
          </div>
          {errorMessage && <p className="text-red-500 mt-1">{errorMessage}</p>}
        </div>

        {teamData && (
          <form onSubmit={handleSubmitEvaluation}>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Team Information</h2>
              <div className="flex items-center">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Ready for Submission
                </span>
                {/* Lock/Unlock button removed */}
              </div>
            </div>
            
            {/* Team Leader Section - Always shown as team leader is required */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-3 text-gray-800">Team Leader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Leader name
                  </label>
                  <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.leaderName || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Enrollment ID
                  </label>
                  <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {teamData.leaderEnrollment || ''}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leader Mobile
                  </label>
                  <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {teamData.leaderMobile || ''}
                  </label>
                </div>
                // Remove checkbox from Team Leader section
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Present: {teamData.leaderPresent ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Member 2 Section - Conditionally rendered */}
            {hasMemberData(teamData.member2Name, teamData.member2Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member2Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member2Enrollment || ''}
                    </label>
                  </div>
                  {/* Replace checkbox with text display for Member 2 */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Present: {teamData.member2Present ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Member 3 Section - Conditionally rendered */}
            {hasMemberData(teamData.member3Name, teamData.member3Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 3</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member3Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member3Enrollment || ''}
                    </label>
                  </div>
                  // Member 3 Section - Remove checkbox
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Present: {teamData.member3Present ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Member 4 Section - Conditionally rendered */}
            {hasMemberData(teamData.member4Name, teamData.member4Enrollment) && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3 text-gray-800">Team Member 4</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Name
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member4Name || ''}
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Enrollment ID
                    </label>
                    <label className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {teamData.member4Enrollment || ''}
                    </label>
                  </div>
                  // Member 4 Section - Remove checkbox
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Present: {teamData.member4Present ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Replace Problem Statement with File Upload */}
            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium mb-3 text-gray-800">Project Submission</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Project Files (Max 10MB)
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                />
                {/* Remove this Save button since we already have one in the uploadFile section */}
                <p className="text-xs text-gray-500 mt-1">
                  Files will be saved in a folder with your team name
                </p>
              </div>
              
              {uploadFile && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
                    disabled={isUploading}
                  >
                    {isUploading ? `Saving... ${uploadProgress}%` : "Save"}
                  </button>
                </div>
              )}
            </div>

            {/* Remove Evaluation Section - deleted */}
            
            {/* Remove the Form buttons section completely */}
          </form>
        )}
      </div>
    </div>
  );
}