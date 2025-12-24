import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface LashEffect {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface EffectsGalleryProps {
  lashEffects: LashEffect[];
  selectedEffect: string;
  setSelectedEffect: (effect: string) => void;
}

export default function EffectsGallery({
  lashEffects,
  selectedEffect,
  setSelectedEffect
}: EffectsGalleryProps) {
  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Icon name="Wand2" className="text-primary" />
        Каталог эффектов наращивания
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lashEffects.map((effect, index) => (
          <Card
            key={effect.id}
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 animate-scale-in ${
              selectedEffect === effect.id
                ? 'ring-2 ring-primary bg-gradient-to-br from-pink-50 to-purple-50'
                : 'hover:bg-accent/50'
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => {
              setSelectedEffect(effect.id);
              toast.success(`Выбран эффект: ${effect.name} ✨`);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl">{effect.preview}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{effect.name}</h3>
                <p className="text-sm text-gray-600">{effect.description}</p>
              </div>
              {selectedEffect === effect.id && (
                <Icon name="Check" className="text-primary" size={24} />
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
