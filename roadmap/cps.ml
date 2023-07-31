type direction = Next | Back

let rec prompt x =
  print_endline ("prompt: " ^ Int.to_string x);
  match read_line () with
  | "next" | "n" -> Next
  | "back" | "b" -> Back
  | _ -> prompt x

let add15 x = x + 15
let times2 x = x * 2
let sub3 x = x - 3
(* let kthen k f x k' = k' ((k x) (fun x -> match prompt x with _ -> f x))
   let knull x k = k x
   let k0s = kthen knull add15
   let k1s = kthen k0s times2
   let k2s = kthen k1s sub3 *)
(*********)

let rec fbuilder f (x, bk, fk) =
  match prompt x with
  | Next -> fk (f x, fun () -> (fbuilder f) (x, bk, fk))
  | Back -> bk ()

let rec k0 = fbuilder add15
let rec k1 = fbuilder times2
let rec k2 = fbuilder sub3
let thenk f f' (x, bk, fk) = f (x, bk, fun (x', r) -> f' (x', r, fk))

let branchk cond t f (x, bk, fk) =
  if cond x then t (x, bk, fk) else f (x, bk, fk)

let fail () = print_endline "Back at start"
let finish (x, _) = print_endline ("Final value: " ^ Int.to_string x)
let trigger = thenk k0 (thenk k2 (thenk k0 k1))
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
