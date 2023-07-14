
type button_hit = Next | Back

let fail () = print_endline "failed" 
let succ value = print_endline ("Final value: " ^ Int.to_string value)


let compose_forms (parent: 'a) (forms: int list) (initial: int) (fail: unit -> unit) (succ: int -> unit) = 
  let rec compose forms value fail succ = match forms with 
    | [] -> succ value
    | (f :: fs) -> render (parent, f);
      match get_hit () with
      | Next -> compose fs (transform (f, value)) (fun () -> compose forms value fail succ) succ 
      | Back -> fail ()

and render (_, form) = print_endline @@ Int.to_string form
(* imagine this is the equivalent of hitting continue or back *)
and get_hit () = match read_line () with 
| "next" -> Next
| "back" -> Back
| _ -> failwith "invalid input"
(* imagine this is the equivalent of filling a field *)
and transform (value, form) = match read_line() with 
| "add" -> value + form
| "sub" -> value - form
| _ -> failwith "invalid input"
in compose forms initial fail succ

let one_through_five_form = compose_forms 0 [1; 2; 3; 4; 5] 0

let () = one_through_five_form fail succ