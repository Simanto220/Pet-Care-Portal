import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Save } from 'lucide-react';
import PetFormFields from './PetFormFields';

const EditPetModal = ({ selectedPet, setSelectedPet, handlePetUpdate, handleDeletePet }) => {
  const addPhoto = (url) => {
    const currentPhotos = selectedPet.photos || [];
    if (url && !currentPhotos.includes(url)) {
      setSelectedPet({ ...selectedPet, photos: [...currentPhotos, url] });
    }
  };

  const removePhoto = (photo) => {
    const currentPhotos = selectedPet.photos || [];
    setSelectedPet({ ...selectedPet, photos: currentPhotos.filter((p) => p !== photo) });
  };

  const addTrait = (trait) => {
    const currentTraits = selectedPet.traits || [];
    if (trait && !currentTraits.includes(trait)) {
      setSelectedPet({ ...selectedPet, traits: [...currentTraits, trait] });
    }
  };

  const removeTrait = (trait) => {
    const currentTraits = selectedPet.traits || [];
    setSelectedPet({ ...selectedPet, traits: currentTraits.filter((t) => t !== trait) });
  };

  const addHealthRecord = (record) => {
    const currentRecords = selectedPet.healthRecords || [];
    if (record && !currentRecords.includes(record)) {
      setSelectedPet({ ...selectedPet, healthRecords: [...currentRecords, record] });
    }
  };

  const removeHealthRecord = (record) => {
    const currentRecords = selectedPet.healthRecords || [];
    setSelectedPet({ ...selectedPet, healthRecords: currentRecords.filter((r) => r !== record) });
  };

  return (
    <Dialog open={true} onOpenChange={() => setSelectedPet(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Edit {selectedPet.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Pet Photos</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {(selectedPet.photos || []).map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={photo} alt={`${selectedPet.name} ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    onClick={() => removePhoto(photo)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    addPhoto(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value) {
                    addPhoto(input.value);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
          <PetFormFields 
            petData={selectedPet} 
            setPetData={setSelectedPet} 
            addTrait={addTrait} 
            removeTrait={removeTrait} 
            addHealthRecord={addHealthRecord}
            removeHealthRecord={removeHealthRecord}
          />
        </div>
        <DialogFooter>
          <Button onClick={handlePetUpdate} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
          <Button onClick={() => setSelectedPet(null)} variant="outline" className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={() => handleDeletePet(selectedPet._id || selectedPet.id)}
            variant="destructive"
            className="flex items-center gap-2 ml-auto"
          >
            <X className="w-4 h-4" />
            Delete Pet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPetModal;
