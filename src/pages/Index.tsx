import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface LashEffect {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface LashParams {
  volume: string;
  curl: string;
  length: number;
}

interface SavedVariant {
  id: string;
  image: string;
  effect: string;
  effectName: string;
  params: LashParams;
  timestamp: number;
}

const lashEffects: LashEffect[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Натуральный эффект, одна ресничка к одной',
    preview: '👁️'
  },
  {
    id: 'volume',
    name: 'Volume',
    description: 'Объемный эффект для выразительности',
    preview: '✨'
  },
  {
    id: 'mega',
    name: 'Mega Volume',
    description: 'Максимальная пышность и драма',
    preview: '💫'
  },
  {
    id: 'hollywood',
    name: 'Hollywood',
    description: 'Гламурный эффект с максимальной длиной',
    preview: '⭐'
  },
  {
    id: 'cat-eye',
    name: 'Cat Eye',
    description: 'Удлинение к внешнему уголку',
    preview: '😼'
  },
  {
    id: 'doll',
    name: 'Doll Eye',
    description: 'Кукольный эффект с акцентом на центр',
    preview: '🎀'
  }
];

const volumes = ['2D', '3D', '4D', '5D', '6D'];
const curls = ['C', 'D', 'L', 'M'];

export default function Index() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>('classic');
  const [params, setParams] = useState<LashParams>({
    volume: '3D',
    curl: 'D',
    length: 10
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedVariants, setSavedVariants] = useState<SavedVariant[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        toast.success('Фото загружено успешно! 📸');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Пожалуйста, загрузите изображение');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processImageWithAI = async () => {
    if (!uploadedImage) {
      toast.error('Сначала загрузите фото');
      return;
    }

    setIsProcessing(true);
    toast.loading('ИИ обрабатывает ваше фото...', { id: 'processing' });

    try {
      const response = await fetch('https://functions.poehali.dev/f3f5fd3a-c6cb-432a-b0e9-b04224164a45', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: uploadedImage,
          effect: selectedEffect,
          volume: params.volume,
          curl: params.curl,
          length: params.length
        })
      });

      const data = await response.json();

      if (data.success) {
        setProcessedImage(data.processedImage);
        toast.success('Эффект наращивания применен! ✨', { id: 'processing' });
        
        const variant: SavedVariant = {
          id: Date.now().toString(),
          image: data.processedImage,
          effect: selectedEffect,
          effectName: lashEffects.find(e => e.id === selectedEffect)?.name || selectedEffect,
          params: { ...params },
          timestamp: Date.now()
        };
        setSavedVariants(prev => [variant, ...prev]);
      } else {
        toast.error('Ошибка обработки', { id: 'processing' });
      }
    } catch (error) {
      toast.error('Не удалось обработать фото', { id: 'processing' });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCompareSelection = (variantId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(variantId)) {
        return prev.filter(id => id !== variantId);
      }
      if (prev.length >= 3) {
        toast.info('Можно сравнить максимум 3 варианта');
        return prev;
      }
      return [...prev, variantId];
    });
  };

  const deleteVariant = (variantId: string) => {
    setSavedVariants(prev => prev.filter(v => v.id !== variantId));
    setSelectedForCompare(prev => prev.filter(id => id !== variantId));
    toast.success('Вариант удален');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent">
            Lash Studio AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Виртуальная примерка наращивания ресниц с технологией искусственного интеллекта
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 backdrop-blur-sm bg-white/80 shadow-xl animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Icon name="Upload" className="text-primary" />
              Загрузите фото глаз
            </h2>
            
            {!uploadedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <Icon name="Image" size={40} className="text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Перетащите фото сюда
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      или нажмите кнопку ниже
                    </p>
                  </div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      asChild
                    >
                      <span>
                        <Icon name="Upload" className="mr-2" size={20} />
                        Выбрать фото
                      </span>
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={uploadedImage} 
                      alt="Original" 
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    <Badge className="absolute top-4 left-4 bg-white/90 text-gray-700">
                      <Icon name="Image" size={16} className="mr-1" />
                      Оригинал
                    </Badge>
                  </div>
                  
                  {processedImage && (
                    <div className="relative rounded-2xl overflow-hidden shadow-lg animate-fade-in">
                      <img 
                        src={processedImage} 
                        alt="Processed" 
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                        <Icon name="Sparkles" size={16} className="mr-1" />
                        С наращиванием
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    onClick={processImageWithAI}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Icon name="Wand2" className="mr-2" size={20} />
                        Примерить эффект
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUploadedImage(null);
                      setProcessedImage(null);
                    }}
                  >
                    <Icon name="RefreshCw" size={20} />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-white/80 shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Icon name="Sparkles" className="text-primary" />
              Параметры наращивания
            </h2>

            <Tabs defaultValue="volume" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="volume">Объем</TabsTrigger>
                <TabsTrigger value="curl">Изгиб</TabsTrigger>
                <TabsTrigger value="length">Длина</TabsTrigger>
              </TabsList>

              <TabsContent value="volume" className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {volumes.map((vol) => (
                    <Button
                      key={vol}
                      variant={params.volume === vol ? 'default' : 'outline'}
                      className={`transition-all ${
                        params.volume === vol 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 scale-105' 
                          : 'hover:scale-105'
                      }`}
                      onClick={() => setParams({ ...params, volume: vol })}
                    >
                      {vol}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Чем выше объем, тем пышнее будут ресницы
                </p>
              </TabsContent>

              <TabsContent value="curl" className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {curls.map((curl) => (
                    <Button
                      key={curl}
                      variant={params.curl === curl ? 'default' : 'outline'}
                      className={`transition-all ${
                        params.curl === curl 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 scale-105' 
                          : 'hover:scale-105'
                      }`}
                      onClick={() => setParams({ ...params, curl })}
                    >
                      {curl}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>C</strong> — легкий изгиб</p>
                  <p><strong>D</strong> — средний изгиб</p>
                  <p><strong>L</strong> — сильный изгиб</p>
                  <p><strong>M</strong> — максимальный изгиб</p>
                </div>
              </TabsContent>

              <TabsContent value="length" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Длина ресниц</span>
                    <Badge variant="secondary" className="text-lg">
                      {params.length} мм
                    </Badge>
                  </div>
                  <Slider
                    value={[params.length]}
                    onValueChange={([value]) => setParams({ ...params, length: value })}
                    min={6}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>6 мм</span>
                    <span>15 мм</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Оптимальная длина: 10-12 мм для естественного эффекта
                </p>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="text-primary mt-1" size={20} />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Текущие параметры:</p>
                  <p>Объем: <strong>{params.volume}</strong> • Изгиб: <strong>{params.curl}</strong> • Длина: <strong>{params.length} мм</strong></p>
                </div>
              </div>
            </div>
          </Card>
        </div>

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

        {processedImage && (
          <div className="mt-8 flex justify-center gap-4 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
              onClick={() => {
                const link = document.createElement('a');
                link.href = processedImage;
                link.download = `lash-effect-${selectedEffect}.png`;
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
              onClick={processImageWithAI}
              disabled={isProcessing}
            >
              <Icon name="RefreshCw" className="mr-2" />
              Пересчитать
            </Button>
          </div>
        )}

        {savedVariants.length > 0 && (
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
        )}
      </div>
    </div>
  );
}