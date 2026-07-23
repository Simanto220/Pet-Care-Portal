import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Stethoscope, Calendar, FileText, User, Phone, MapPin, CheckCircle, ArrowLeft } from "lucide-react";

const PetProfile = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/pet/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch pet profile");
        const data = await res.json();
        setPet(data.pet);
        setMedicalRecords(data.medicalRecords || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPetProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading pet profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Pet not found.</p>
      </div>
    );
  }

  const getAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <img
              src={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${pet.profilePhoto}`}
              alt={pet.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-md text-gray-600">{pet.breed}</p>
              <p className="text-sm text-gray-500">{pet.status}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
          <p className="text-gray-700">
            {pet.description || "No description available."}
          </p>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Details</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li>
              <strong>Species:</strong> {pet.species}
            </li>
            <li>
              <strong>Age:</strong> {getAge(pet.dateOfBirth)} years
            </li>
            <li>
              <strong>Color:</strong> {pet.color}
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Traits</h2>
          <div className="flex flex-wrap gap-2">
            {pet.traits && pet.traits.length > 0 ? (
              pet.traits.map((trait, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
                >
                  {trait}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No traits listed.</p>
            )}
          </div>
        </div>

        {/* Doctor Prescriptions & Medical Records */}
        <div className="border-t border-gray-200 px-6 py-6 bg-purple-50/30">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="text-purple-600" /> Doctor Prescriptions & Diagnosis History
          </h2>

          {medicalRecords && medicalRecords.length > 0 ? (
            <div className="space-y-4">
              {medicalRecords.map((rec) => (
                <div key={rec._id} className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 text-purple-700 p-2 rounded-xl">
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rec.vetId?.name || "Veterinary Doctor"}</p>
                        <p className="text-xs text-purple-600 font-semibold">{rec.vetId?.specialization || "Specialist Vet"}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                      📅 {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Details / Diagnosis */}
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Diagnosis & Prescription Details:</p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {rec.details}
                    </p>
                  </div>

                  {/* Vaccination Records */}
                  {rec.vaccinationRecords && rec.vaccinationRecords.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vaccinations Administered:</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.vaccinationRecords.map((v, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
                            💉 {v.name} (Given: {v.date}) {v.nextDue ? `· Next Due: ${v.nextDue}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No prescription records added by doctor yet.</p>
              <p className="text-xs text-gray-400 mt-1">Medical records added by veterinarians during appointments will appear here.</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Photos</h2>
          {pet.photos && pet.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pet.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${photo}`}
                  alt={`${pet.name} ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No additional photos available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
