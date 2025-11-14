import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Camera,
  Upload,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMobileForm, useMobileKeyboard } from '@/hooks/use-mobile-utils';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'date' | 'file' | 'image' | 'multi-select';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
  defaultValue?: any;
  disabled?: boolean;
  description?: string;
}

interface MobileAdminFormProps {
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: FormData) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  showCancel?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single' | 'double' | 'tabs';
  sections?: Array<{ title: string; fields: string[] }>;
  showSaveDraft?: boolean;
  onSaveDraft?: (data: FormData) => Promise<void> | void;
}

export const MobileAdminForm: React.FC<MobileAdminFormProps> = ({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  error,
  success,
  showCancel = true,
  submitLabel = 'Kaydet',
  cancelLabel = 'İptal',
  layout = 'single',
  sections,
  showSaveDraft = false,
  onSaveDraft
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [activeSection, setActiveSection] = useState(0);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [calendarOpen, setCalendarOpen] = useState<Record<string, boolean>>({});
  const [draftSaved, setDraftSaved] = useState(false);

  const { keyboardHeight, isKeyboardOpen } = useMobileKeyboard();
  const { errors, touched, handleChange, handleBlur, validateField } = useMobileForm();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (name: string, value: any, type: string = 'text') => {
    const field = fields.find(f => f.name === name);
    if (!field) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle real-time validation
    if (field.validation) {
      handleChange(name, value, field.validation);
    }
  };

  const handleFieldBlur = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (field?.validation) {
      handleBlur(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    let hasErrors = false;
    const newErrors: Record<string, string[]> = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = [`${field.label} alanı zorunludur`];
        hasErrors = true;
      }
      
      if (field.validation && formData[field.name]) {
        const fieldErrors = validateField(field.label, formData[field.name], field.validation);
        if (fieldErrors.length > 0) {
          newErrors[field.name] = fieldErrors;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      console.error('Form validation errors:', newErrors);
      return;
    }

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formDataObj.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formDataObj.append(`${key}[]`, item));
        } else {
          formDataObj.append(key, String(value));
        }
      }
    });

    try {
      await onSubmit(formDataObj);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataObj.append(key, String(value));
      }
    });

    try {
      await onSaveDraft(formDataObj);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (error) {
      console.error('Draft save error:', error);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? field.defaultValue ?? '';
    const hasError = errors[field.name] && touched[field.name];
    
    const baseInputClasses = `w-full ${hasError ? 'border-red-500' : ''} ${
      isKeyboardOpen ? 'text-lg' : 'text-base'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={field.disabled}
              rows={4}
              className={baseInputClasses}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <div className="text-red-500 text-sm">
                {errors[field.name].map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleInputChange(field.name, newValue)}
              disabled={field.disabled}
            >
              <SelectTrigger className={baseInputClasses}>
                <SelectValue placeholder={field.placeholder || 'Seçiniz'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <div className="text-red-500 text-sm">
                {errors[field.name].map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
              disabled={field.disabled}
            />
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      case 'switch':
        return (
          <div key={field.name} className="flex items-center justify-between">
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Switch
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
              disabled={field.disabled}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Popover open={calendarOpen[field.name]} onOpenChange={(open) => 
              setCalendarOpen(prev => ({ ...prev, [field.name]: open }))
            }>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${baseInputClasses} ${
                    !value && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, 'PPP', { locale: tr }) : field.placeholder || 'Tarih seçiniz'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(date) => {
                    handleInputChange(field.name, date);
                    setCalendarOpen(prev => ({ ...prev, [field.name]: false }));
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <div className="text-red-500 text-sm">
                {errors[field.name].map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label
                  htmlFor={field.name}
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {field.type === 'image' ? 'Fotoğraf Seç' : 'Dosya Seç'}
                </Label>
                <Input
                  id={field.name}
                  type="file"
                  accept={field.type === 'image' ? 'image/*' : undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleInputChange(field.name, file);
                  }}
                  className="hidden"
                />
              </div>
              {value && (
                <p className="mt-2 text-sm text-gray-600">
                  Seçilen dosya: {value.name}
                </p>
              )}
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={field.name}
                type={field.type === 'password' && !showPassword[field.name] ? 'password' : field.type}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                onBlur={() => handleFieldBlur(field.name)}
                disabled={field.disabled}
                className={`${baseInputClasses} ${
                  field.type === 'password' ? 'pr-10' : ''
                }`}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
              />
              {field.type === 'password' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(prev => ({
                    ...prev,
                    [field.name]: !prev[field.name]
                  }))}
                >
                  {showPassword[field.name] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <div className="text-red-500 text-sm">
                {errors[field.name].map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  const renderSection = (sectionIndex: number) => {
    if (!sections) return null;
    
    const section = sections[sectionIndex];
    const sectionFields = fields.filter(field => section.fields.includes(field.name));
    
    return (
      <div key={sectionIndex} className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        <div className="grid gap-4">
          {sectionFields.map(renderField)}
        </div>
      </div>
    );
  };

  const renderFields = () => {
    if (layout === 'tabs' && sections) {
      return (
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {sections.map((section, index) => (
              <Button
                key={index}
                variant={activeSection === index ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSection(index)}
                className="flex-1"
              >
                {section.title}
              </Button>
            ))}
          </div>
          {renderSection(activeSection)}
        </div>
      );
    }

    if (layout === 'double') {
      return (
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map(field => (
            <div key={field.name}>
              {renderField(field)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {fields.map(renderField)}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ paddingBottom: isKeyboardOpen ? keyboardHeight : 0 }}
    >
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          
          {showSaveDraft && onSaveDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={loading || draftSaved}
            >
              {draftSaved ? 'Kaydedildi' : 'Taslak Kaydet'}
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            {renderFields()}
          </CardContent>
        </Card>

        <div className="flex gap-4 sticky bottom-4">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-12 text-lg"
            >
              {cancelLabel}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-5 w-5" />
                {submitLabel}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MobileAdminForm;