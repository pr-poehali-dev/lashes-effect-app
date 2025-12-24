import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface LashParams {
  volume: string;
  curl: string;
  length: number;
  color: string;
}

interface SavedVariant {
  id: string;
  image: string;
  effect: string;
  effectName: string;
  params: LashParams;
  timestamp: number;
}

interface SavedVariantsGalleryProps {
  savedVariants: SavedVariant[];
  compareMode: boolean;
  selectedForCompare: string[];
  setCompareMode: (mode: boolean) => void;
  setSelectedForCompare: (ids: string[]) => void;
  toggleCompareSelection: (variantId: string) => void;
  deleteVariant: (variantId: string) => void;
  processedImage: string | null;
}

export default function SavedVariantsGallery({
  savedVariants,
  compareMode,
  selectedForCompare,
  setCompareMode,
  setSelectedForCompare,
  toggleCompareSelection,
  deleteVariant,
  processedImage
}: SavedVariantsGalleryProps) {
  if (savedVariants.length === 0) {
    return null;
  }

  return (
    <>
      {processedImage && (
        <div className="mt-8 flex justify-center gap-4 animate-fade-in">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
            onClick={() => {
              const link = document.createElement('a');
              link.href = processedImage;
              link.download = `lash-effect.png`;
              link.click();
              toast.success('Результат сохранен! 💾');
            }}
          >
            <Icon name="Download" className="mr-2" />
            Скачать результат
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <Icon name="RefreshCw" className="mr-2" />
            Пересчитать
          </Button>
        </div>
      )}

      <Card className="mt-8 p-6 backdrop-blur-sm bg-white/80 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Icon name="Gallery" className="text-primary" />
            Сохраненные варианты ({savedVariants.length})
          </h2>
          <div className="flex gap-2">
            <Button
              variant={compareMode ? "default" : "outline"}
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
              className={compareMode ? "bg-gradient-to-r from-pink-500 to-purple-500" : ""}
            >
              <Icon name="ArrowLeftRight" className="mr-2" size={20} />
              {compareMode ? 'Выйти из сравнения' : 'Сравнить'}
            </Button>
          </div>
        </div>

        {!compareMode ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedVariants.map((variant, index) => (
              <Card 
                key={variant.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative">
                  <img 
                    src={variant.image} 
                    alt={variant.effectName}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                    {variant.effectName}
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => deleteVariant(variant.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Объем:</strong> {variant.params.volume}</p>
                    <p><strong>Изгиб:</strong> {variant.params.curl}</p>
                    <p><strong>Длина:</strong> {variant.params.length} мм</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = variant.image;
                      link.download = `${variant.effectName}-${variant.id}.png`;
                      link.click();
                      toast.success('Скачано!');
                    }}
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Выберите до 3 вариантов для сравнения (выбрано: {selectedForCompare.length})
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {savedVariants.map((variant) => (
                <Card 
                  key={variant.id}
                  className={`overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedForCompare.includes(variant.id)
                      ? 'ring-4 ring-primary scale-105'
                      : 'hover:shadow-lg hover:scale-105'
                  }`}
                  onClick={() => toggleCompareSelection(variant.id)}
                >
                  <div className="relative">
                    <img 
                      src={variant.image} 
                      alt={variant.effectName}
                      className="w-full h-32 object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      {variant.effectName}
                    </Badge>
                    {selectedForCompare.includes(variant.id) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Icon name="Check" size={32} className="text-white" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {selectedForCompare.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Eye" className="text-primary" />
                  Сравнение выбранных вариантов
                </h3>
                <div className={`grid ${selectedForCompare.length === 1 ? 'grid-cols-1' : selectedForCompare.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                  {selectedForCompare.map(variantId => {
                    const variant = savedVariants.find(v => v.id === variantId);
                    if (!variant) return null;
                    return (
                      <div key={variant.id} className="space-y-2">
                        <img 
                          src={variant.image} 
                          alt={variant.effectName}
                          className="w-full rounded-lg shadow-lg"
                        />
                        <div className="text-center">
                          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white mb-2">
                            {variant.effectName}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            <p>{variant.params.volume} • {variant.params.curl} • {variant.params.length}мм</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
