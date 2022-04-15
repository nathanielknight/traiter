Quality Name / Text Value:

```re
([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)
```

# Changes


## gain/lose

Pattern:

```re
(gain|lose) (\d+) ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)
```

Examples:

```text
gain  3  Strength
gain 2  Favor  of the King
lose 3 Cat's Grace
gain 1 What's that?!
gain 11 Fortune_favors_the_bold-final.exe
gain 1 1 4 all
gain 4 "Confidence"
gain 1 cask (amontillado/ppl)
```

## clear

Pattern:

```re
clear ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)
```

Examples:

```text
clear 4 the-king
clear "confidence"
clear What? Drawn, and talk of peace?!
```

## set

Pattern:

```re
set ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+) = (\d+) ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)|set ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+) = (\d+)|set ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+) = ([a-zA-Z0-9 ,.:;"'!?\-_/\\()\[\]+]+)
```

Examples:

```text
set Shields = 3
set shields = maximum
set shields (acid) = 5 (medium)
```