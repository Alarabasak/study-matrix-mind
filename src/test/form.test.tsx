import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function TestForm() {
  const form = useForm({ defaultValues: { answer: '' } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)}>
        <FormField control={form.control} name="answer" rules={{ required: 'Cevap gerekli' }} render={({ field }) => (
          <FormItem>
            <FormLabel>Cevap</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Kontrol et</Button>
      </form>
    </Form>
  );
}

describe('shared form contexts', () => {
  it('connects the label, input and validation message across components', async () => {
    render(<TestForm />);
    const input = screen.getByLabelText('Cevap');
    fireEvent.click(screen.getByRole('button', { name: 'Kontrol et' }));
    const message = await screen.findByText('Cevap gerekli');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(message.id);
    fireEvent.change(input, { target: { value: 'ÇAY' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kontrol et' }));
    await waitFor(() => expect(screen.queryByText('Cevap gerekli')).not.toBeInTheDocument());
    expect(input).toHaveValue('ÇAY');
  });
});
