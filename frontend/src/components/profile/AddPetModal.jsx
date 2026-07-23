import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';
import PetFormFields from './PetFormFields';

const AddPetModal = ({ newPet, setNewPet, handleAddPet, setShowAddPet, addTrait, removeTrait, addHealthRecord, removeHealthRecord }) => (
  <Dialog open={true} onOpenChange={setShowAddPet}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800">Add New Pet</DialogTitle>
      </DialogHeader>
      <PetFormFields 
        petData={newPet} 
        setPetData={setNewPet} 
        addTrait={addTrait}
        removeTrait={removeTrait}
        addHealthRecord={addHealthRecord}
        removeHealthRecord={removeHealthRecord}
      />
      <DialogFooter>
        <Button onClick={handleAddPet} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Add Pet
        </Button>
        <Button onClick={() => setShowAddPet(false)} variant="outline" className="flex items-center gap-2">
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddPetModal;
