import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * AdvancedFilters component for filtering data tables
 * @param {Object} props - Component props
 * @param {Array} props.filters - Array of filter configurations
 * @param {Function} props.onFilter - Callback when filters are applied
 * @param {Function} [props.onReset] - Callback when filters are reset
 * @param {Object} [props.defaultValues] - Default filter values
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.triggerLabel] - Label for the filter trigger button
 * @param {boolean} [props.showReset] - Whether to show the reset button
 * @param {string} [props.submitLabel] - Label for the submit button
 * @param {string} [props.resetLabel] - Label for the reset button
 * @returns {JSX.Element} AdvancedFilters component
 */
const AdvancedFilters = ({
  filters = [],
  onFilter,
  onReset,
  defaultValues = {},
  className,
  triggerLabel = 'Filtres',
  showReset = true,
  submitLabel = 'Appliquer',
  resetLabel = 'Réinitialiser',
}) => {
  const [open, setOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  
  // Create form schema based on filters
  const createFilterSchema = () => {
    const schema = {};
    
    filters.forEach(filter => {
      if (filter.type === 'text' || filter.type === 'search') {
        schema[filter.name] = z.string().optional();
      } else if (filter.type === 'number') {
        schema[filter.name] = z.number().optional();
      } else if (filter.type === 'select') {
        schema[filter.name] = z.string().optional();
      } else if (filter.type === 'date') {
        schema[filter.name] = z.date().optional();
      } else if (filter.type === 'daterange') {
        schema[`${filter.name}From`] = z.date().optional();
        schema[`${filter.name}To`] = z.date().optional();
      } else if (filter.type === 'boolean') {
        schema[filter.name] = z.boolean().optional();
      }
    });
    
    return z.object(schema);
  };
  
  const formSchema = createFilterSchema();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
    },
  });
  
  // Count active filters
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Count non-empty values
      const count = Object.values(value).filter(v => {
        if (v === undefined || v === null || v === '') return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (typeof v === 'object' && Object.keys(v).length === 0) return false;
        return true;
      }).length;
      
      setActiveFilters(count);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  const handleSubmit = (values) => {
    // Filter out empty values
    const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) return acc;
        if (typeof value === 'object' && Object.keys(value).length === 0) return acc;
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onFilter(filteredValues);
    setOpen(false);
  };
  
  const handleReset = () => {
    form.reset({});
    if (onReset) {
      onReset();
    } else {
      onFilter({});
    }
    setActiveFilters(0);
  };
  
  const renderFilterField = (filter) => {
    switch (filter.type) {
      case 'text':
      case 'search':
      case 'number':
        return (
          <FormField
            control={form.control}
            name={filter.name}
            render={({ field }) => (
              <FormItem>
                {filter.label && <FormLabel>{filter.label}</FormLabel>}
                <FormControl>
                  <Input
                    type={filter.type}
                    placeholder={filter.placeholder || filter.label}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                {filter.description && (
                  <FormDescription>{filter.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'select':
        return (
          <FormField
            control={form.control}
            name={filter.name}
            render={({ field }) => (
              <FormItem>
                {filter.label && <FormLabel>{filter.label}</FormLabel>}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder || 'Sélectionner une option'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filter.description && (
                  <FormDescription>{filter.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'date':
        return (
          <FormField
            control={form.control}
            name={filter.name}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                {filter.label && <FormLabel>{filter.label}</FormLabel>}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>{filter.placeholder || 'Sélectionner une date'}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date) =>
                        (filter.minDate && date < new Date(filter.minDate)) ||
                        (filter.maxDate && date > new Date(filter.maxDate))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {filter.description && (
                  <FormDescription>{filter.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case 'daterange':
        return (
          <div className="space-y-2">
            {filter.label && <Label>{filter.label}</Label>}
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`${filter.name}From`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Du</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP')
                            ) : (
                              <span>Date de début</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`${filter.name}To`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Au</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP')
                            ) : (
                              <span>Date de fin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {filter.description && (
              <FormDescription>{filter.description}</FormDescription>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <FormField
            control={form.control}
            name={filter.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {filter.label}
                  </FormLabel>
                  {filter.description && (
                    <FormDescription>
                      {filter.description}
                    </FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 border-dashed", className)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {triggerLabel}
          {activeFilters > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilters}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.name}>
                  {renderFilterField(filter)}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-2">
              {showReset && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  {resetLabel}
                </Button>
              )}
              
              <Button type="submit" size="sm" className="ml-auto">
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedFilters;
