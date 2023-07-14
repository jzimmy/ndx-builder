type button_hit = Next | Back

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
let () = one_through_five_form fail succ
