import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ImageUploadSectionProps {
  uploadedImage: string | null;
  processedImage: string | null;
  isDragging: boolean;
  isProcessing: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleFileUpload: (file: File) => void;
  processImageWithAI: () => void;
  setUploadedImage: (image: string | null) => void;
  setProcessedImage: (image: string | null) => void;
}

export default function ImageUploadSection({
  uploadedImage,
  processedImage,
  isDragging,
  isProcessing,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileUpload,
  processImageWithAI,
  setUploadedImage,
  setProcessedImage
}: ImageUploadSectionProps) {
  return (
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
  );
}
