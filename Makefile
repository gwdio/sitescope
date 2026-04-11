install:
	cd frontend && npm install
	@if [ -n "$$CONDA_PREFIX" ]; then \
		echo "conda env detected — installing into active env"; \
		pip install -r backend/requirements.txt; \
	else \
		echo "no conda env — creating backend/.venv"; \
		python -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt; \
	fi

dev:
	make -j2 dev-backend dev-frontend

dev-backend:
	@if [ -n "$$CONDA_PREFIX" ]; then \
		cd backend && uvicorn main:app --reload --port 8000; \
	else \
		cd backend && .venv/bin/uvicorn main:app --reload --port 8000; \
	fi

dev-frontend:
	cd frontend && npm run dev
