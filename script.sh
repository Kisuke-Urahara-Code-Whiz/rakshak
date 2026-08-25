java()(
	cd backend
	mkdir java
	cd java
	touch README.md
	echo -e  'this is strictly for java backend dev' >> README.md
        cd ../
	mkdir python
	cd python
	touch README.md
	echo -e 'this is strictly for python backend dev and model dev for risk engine' >> README.md
)

admin()(
	cd admin
	touch README.md
	echo -e 'This is for frontend admin authorities app' >> README.md
	cd ../user
	touch README.md
	echo -e 'This is for frontend user app' >> README.md
)

admin
cat admin/README.md
cat user/README.md

        	
