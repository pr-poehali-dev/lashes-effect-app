import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface LashParams {
  volume: string;
  curl: string;
  length: number;
  color: string;
}

interface LashColor {
  id: string;
  name: string;
  hex: string;
}

interface ParametersPanelProps {
  params: LashParams;
  setParams: (params: LashParams) => void;
  volumes: string[];
  curls: string[];
  lashColors: LashColor[];
}

export default function ParametersPanel({
  params,
  setParams,
  volumes,
  curls,
  lashColors
}: ParametersPanelProps) {
  return (
    <Card className="p-6 backdrop-blur-sm bg-white/80 shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="Sparkles" className="text-primary" />
        Параметры наращивания
      </h2>

      <Tabs defaultValue="volume" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="volume">Объем</TabsTrigger>
          <TabsTrigger value="curl">Изгиб</TabsTrigger>
          <TabsTrigger value="length">Длина</TabsTrigger>
          <TabsTrigger value="color">Цвет</TabsTrigger>
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

        <TabsContent value="color" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lashColors.map((color) => (
              <Button
                key={color.id}
                variant={params.color === color.id ? 'default' : 'outline'}
                className={`transition-all h-auto py-3 ${
                  params.color === color.id 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 scale-105 ring-2 ring-primary' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setParams({ ...params, color: color.id })}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </div>
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Черный — классика, коричневый — для натурального образа, цветные — для яркого акцента
          </p>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-primary mt-1" size={20} />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Текущие параметры:</p>
            <p>Объем: <strong>{params.volume}</strong> • Изгиб: <strong>{params.curl}</strong> • Длина: <strong>{params.length} мм</strong> • Цвет: <strong>{lashColors.find(c => c.id === params.color)?.name || params.color}</strong></p>
          </div>
        </div>
      </div>
    </Card>
  );
}
