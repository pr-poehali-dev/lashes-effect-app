import { useState } from 'react';
import { toast } from 'sonner';
import ImageUploadSection from '@/components/lash/ImageUploadSection';
import ParametersPanel from '@/components/lash/ParametersPanel';
import EffectsGallery from '@/components/lash/EffectsGallery';
import SavedVariantsGallery from '@/components/lash/SavedVariantsGallery';

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
const lashColors = [
  { id: 'black', name: 'Черный', hex: '#000000' },
  { id: 'brown', name: 'Коричневый', hex: '#3E2723' },
  { id: 'blue', name: 'Синий', hex: '#1565C0' },
  { id: 'purple', name: 'Фиолетовый', hex: '#6A1B9A' },
  { id: 'green', name: 'Зеленый', hex: '#2E7D32' }
];

export default function Index() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>('classic');
  const [params, setParams] = useState<LashParams>({
    volume: '3D',
    curl: 'D',
    length: 10,
    color: 'black'
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
          length: params.length,
          color: params.color
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
          <ImageUploadSection
            uploadedImage={uploadedImage}
            processedImage={processedImage}
            isDragging={isDragging}
            isProcessing={isProcessing}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleFileUpload={handleFileUpload}
            processImageWithAI={processImageWithAI}
            setUploadedImage={setUploadedImage}
            setProcessedImage={setProcessedImage}
          />

          <ParametersPanel
            params={params}
            setParams={setParams}
            volumes={volumes}
            curls={curls}
            lashColors={lashColors}
          />
        </div>

        <EffectsGallery
          lashEffects={lashEffects}
          selectedEffect={selectedEffect}
          setSelectedEffect={setSelectedEffect}
        />

        <SavedVariantsGallery
          savedVariants={savedVariants}
          compareMode={compareMode}
          selectedForCompare={selectedForCompare}
          setCompareMode={setCompareMode}
          setSelectedForCompare={setSelectedForCompare}
          toggleCompareSelection={toggleCompareSelection}
          deleteVariant={deleteVariant}
          processedImage={processedImage}
        />
      </div>
    </div>
  );
}
