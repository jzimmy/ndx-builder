type direction = Next | Back

let rec prompt x =
  print_endline ("prompt: " ^ Int.to_string x);
  match read_line () with
  | "next" | "n" -> Next
  | "back" | "b" -> Back
  | _ -> prompt x

let isodd x = x / 2 * 2 <> x
let add15 x = x + 15
let times2 x = x * 2
let sub3 x = x - 3
let askn _ = read_int ()

let rec fbuilder f (states, i) (x, bk, fk) =
  print_states states i;
  match prompt x with
  | Next -> fk (f x, fun () -> (fbuilder f) (states, i) (x, bk, fk))
  | Back -> bk ()

and print_states ts i =
  match (ts, i) with
  | [], _ -> print_endline ""
  | t :: ts, 0 ->
      print_string ("**" ^ t ^ "** ");
      print_states ts (i - 1)
  | t :: ts, _ ->
      print_string (t ^ " ");
      print_states ts (i - 1)

let states = [ "add15"; "times2"; "sub3" ]
let fnull _ (x, bk, fk) = fk (x, bk)
let a15 = fbuilder add15
let ask = fbuilder askn
let t2 = fbuilder times2
let s3 = fbuilder sub3
let thenk (t, t') (x, bk, fk) = t (x, bk, fun (x', bk') -> t' (x', bk', fk))
let kthen f k = thenk (f, k)
let ( ==> ) f k = thenk (f, k)

let branchk (cond, tt, tf) (x, bk, fk) =
  if cond x then tt (x, bk, fk) else tf (x, bk, fk)

let ( |< ) cond (t, f) = branchk (cond, t, f)
let fail () = print_endline "Back at start"
let finish (x, _) = print_endline ("Final value: " ^ Int.to_string x)

let trigger =
  fnull (states, -1)
  ==> ask (states, -1)
  ==> (isodd |< (t2 (states, 1) ==> a15 (states, 0), s3 (states, 2)))
  ==> a15 (states, 0)

let main () = trigger (0, fail, finish)
let _ = main ()

(* type button_hit = Next | Back


   let fail () = print_endline "Closing form!"
   let succ value = print_endline ("Final value: " ^ Int.to_string value)

   let compose_forms (parent, forms, initial) fail succ =
     print_endline ("Starting with " ^ Int.to_string initial);
     (* recursive continuation passing only applies to the back button *)
     let rec compose forms value fail succ =
       match forms with
       | [] -> succ value
       | f :: fs -> (
           render (parent, f, value);
           let transform = transformation f in
           match next_or_back () with
           | Next ->
               compose fs (transform value)
                 (fun () -> compose forms (transform value) fail succ)
                 succ
           | Back -> fail ())
     (* imagine this is the equivalent rendering the form *)
     and render (_, form, value) =
       print_endline
         ("Presenting form: " ^ Int.to_string form ^ " with value: "
        ^ Int.to_string value)
     (* imagine this is the equivalent of hitting continue or back *)
     and next_or_back () =
       print_endline "next or back?";
       match read_line () with
       | "next" -> Next
       | "back" -> Back
       | _ ->
           print_endline "invalid input, enter 'next' or 'back':";
           next_or_back ()
     (* imagine this is the equivalent of filling a field *)
     and transformation form =
       print_endline ("add or sub? " ^ Int.to_string form);
       let flip f x y = f x y in
       let id x = x in
       match read_line () with
       | "add" -> flip ( + ) form
       | "sub" -> flip ( - ) form
       | "mul" -> flip ( * ) form
       | "none" -> id
       | _ ->
           print_endline "invalid input, enter 'add' or 'sub':";
           transformation form
     in
     compose forms initial fail succ

   let one_through_five_form = compose_forms (0, [ 1; 2; 3; 4; 5 ], -50)
   let () = one_through_five_form fail succ *)
