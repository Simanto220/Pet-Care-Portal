import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PetFormFields = ({
  petData,
  setPetData,
  addTrait,
  removeTrait,
  addHealthRecord,
  removeHealthRecord,
}) => {
  const handleAddTrait = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      addTrait(e.target.value.trim());
      e.target.value = "";
    }
  };

  const handleAddHealthRecord = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      addHealthRecord(e.target.value.trim());
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet Name *
          </label>
          <Input
            value={petData.name}
            onChange={(e) => setPetData({ ...petData, name: e.target.value })}
            placeholder="Enter pet name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species *
          </label>
          <Select
            value={petData.species}
            onValueChange={(value) =>
              setPetData({ ...petData, species: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dog">Dog</SelectItem>
              <SelectItem value="Cat">Cat</SelectItem>
              <SelectItem value="Bird">Bird</SelectItem>
              <SelectItem value="Rabbit">Rabbit</SelectItem>
              <SelectItem value="Fish">Fish</SelectItem>
              <SelectItem value="Hamster">Hamster</SelectItem>
              <SelectItem value="Guinea Pig">Guinea Pig</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Breed *
          </label>
          <Input
            value={petData.breed}
            onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
            placeholder="Enter breed"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <Input
            type="date"
            value={petData.dateOfBirth ? petData.dateOfBirth.substring(0, 10) : ""}
            onChange={(e) =>
              setPetData({ ...petData, dateOfBirth: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color *
          </label>
          <Input
            value={petData.color}
            onChange={(e) => setPetData({ ...petData, color: e.target.value })}
            placeholder="Enter pet's color"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Photo
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // Handle file upload here - you can integrate with your image upload handler
              setPetData({ ...petData, profilePhoto: file });
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Photos
        </label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              // Handle multiple file upload here
              setPetData({ ...petData, photos: files });
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          value={petData.description}
          onChange={(e) =>
            setPetData({ ...petData, description: e.target.value })
          }
          rows={3}
          placeholder="Describe your pet's personality and characteristics"
        />
      </div>

      {addTrait && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pet Traits
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {petData.traits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {trait}
                <button
                  onClick={() => removeTrait(trait)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a trait (e.g., Friendly, Energetic)"
              onKeyPress={handleAddTrait}
            />
            <Button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value.trim()) {
                  addTrait(input.value.trim());
                  input.value = "";
                }
              }}
            >
              Add Trait
            </Button>
          </div>
        </div>
      )}

      {addHealthRecord && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Health Records
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {petData.healthRecords.map((record, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
              >
                {record}
                <button
                  onClick={() => removeHealthRecord(record)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add health record (e.g., Vaccinated, Spayed/Neutered)"
              onKeyPress={handleAddHealthRecord}
            />
            <Button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value.trim()) {
                  addHealthRecord(input.value.trim());
                  input.value = "";
                }
              }}
            >
              Add Record
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetFormFields;
