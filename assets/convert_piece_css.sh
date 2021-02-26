#!/bin/bash

files=$(/bin/ls piece-css/*)

for file in $files 
do
   #sed -i -e 's/is2d/cg-wrap/g' $file
   #sed -i -e 's/.pawn/piece.pawn/g' $file
   #sed -i -e 's/.knight/piece.knight/g' $file
   #sed -i -e 's/.bishop/piece.bishop/g' $file
   #sed -i -e 's/.rook/piece.rook/g' $file
   #sed -i -e 's/.queen/piece.queen/g' $file
   #sed -i -e 's/.king/piece.king/g' $file

   basename=$(basename $file .css)
   #sed -i -e "s/.cg-wrap/.$basename .cg-wrap/g" $file

   #echo import \"../assets/$file\"\;
   echo -n "\"$basename\", "
done
