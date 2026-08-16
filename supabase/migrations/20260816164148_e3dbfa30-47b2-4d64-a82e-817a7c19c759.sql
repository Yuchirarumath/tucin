
CREATE OR REPLACE FUNCTION public.place_order(_items jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _order_id uuid;
  _total numeric(10,2) := 0;
  _item jsonb;
  _pid uuid;
  _qty int;
  _price numeric(10,2);
  _stock int;
  _name text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  INSERT INTO public.orders (user_id, total_amount, status)
  VALUES (_uid, 0, 'paid')
  RETURNING id INTO _order_id;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _pid := (_item->>'product_id')::uuid;
    _qty := (_item->>'quantity')::int;
    IF _qty IS NULL OR _qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT price, stock_quantity, name INTO _price, _stock, _name
    FROM public.products WHERE id = _pid FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found';
    END IF;
    IF _stock < _qty THEN
      RAISE EXCEPTION 'Not enough stock for %', _name;
    END IF;

    UPDATE public.products SET stock_quantity = stock_quantity - _qty WHERE id = _pid;

    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (_order_id, _pid, _qty, _price);

    _total := _total + (_price * _qty);
  END LOOP;

  UPDATE public.orders SET total_amount = _total WHERE id = _order_id;
  RETURN _order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO authenticated, service_role;
