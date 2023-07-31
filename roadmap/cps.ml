(* type direction = Next | Back

   let rec prompt x =
     print_endline ("prompt: " ^ Int.to_string x);
     match read_line () with
     | "next" | "n" -> Next
     | "back" | "b" -> Back
     | _ -> prompt x

   let add15 x = x + 15
   let times2 x = x * 2
   let sub3 x = x - 3

   let addprompt f x =
     let _ = prompt x in
     f x

   let add15_p = addprompt add15
   let times2_p = addprompt times2
   let sub3_p = addprompt sub3
   let kthen k f x k' = k' ((k x) f)
   let knull x k = k x
   let k0 = kthen knull add15
   let k1 = kthen k0 times2
   let k2 = kthen k1 sub3
   let _ = k2 0 (fun x -> x)
   let promptf f x bk nk = match prompt x with Next -> nk (f x) | Back -> bk x

   (**)

   let fail _ = print_endline "Back at start"
   let finish x = print_endline ("Final value: " ^ Int.to_string x)
   let f0 (v, bk, fk) = promptf add15 v bk fk
   let f1 (v, bk, fk) = promptf times2 v bk fk
   let f2 (v, bk, fk) = promptf sub3 v bk fk

   type 'a triggerargs = 'a * unit -> unit * 'a -> unit
   type 'a trigger = 'a triggerargs -> unit

   let rec chain ((t1 : 'a trigger), (t2 : 'a trigger)) (v, bk, fk) =
     t1 (v, bk, fun v' -> t2 (v', () -> chain (t1, t2)(v, bk, fk), fk))

   let main () = chain (f0, f1) (0, fail, finish)
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
      let () = one_through_five_form fail succ *) *)
